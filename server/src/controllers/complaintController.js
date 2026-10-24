const crypto = require('crypto');
const Complaint = require('../models/Complaint');
const Village = require('../models/Village');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, buildMeta } = require('../utils/response');
const { assertObjectId, escapeRegex } = require('../utils/validate');

const COMPLAINT_STATUSES = Complaint.STATUSES;
const COMPLAINT_CATEGORIES = Complaint.CATEGORIES;

const assignedVillageId = (user) => user?.villageId?._id || user?.villageId || null;

const generateTicketCode = async () => {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `SV-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const exists = await Complaint.exists({ ticketCode: code });
    if (!exists) return code;
  }
  throw new ApiError(500, 'Could not generate a unique ticket ID. Please try again.');
};

const populateSafe = (query) =>
  query
    .populate('citizenId', 'name email phone')
    .populate('villageId', 'name district state villageCode');

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 8));
  return { page, limit };
};

const baseScope = (req) => {
  if (req.user.role === 'Village Officer') {
    const village = assignedVillageId(req.user);
    if (!village) throw new ApiError(403, 'No village is assigned to your account');
    return { villageId: village };
  }
  return { citizenId: req.user._id };
};





const createComplaint = catchAsync(async (req, res) => {
  const { title, category, description = '' } = req.body;
  if (!title || !String(title).trim()) throw new ApiError(400, 'Complaint title is required');
  if (String(title).trim().length < 4) throw new ApiError(400, 'Complaint title is too short');
  if (!COMPLAINT_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Category must be one of: ${COMPLAINT_CATEGORIES.join(', ')}`);
  }
  if (description && String(description).length > 2000) {
    throw new ApiError(400, 'Description cannot exceed 2000 characters');
  }

  let villageId;
  if (req.user.role === 'Village Officer') {
    villageId = assignedVillageId(req.user);
    if (!villageId) throw new ApiError(403, 'No village is assigned to your account');
  } else {
    villageId = req.body.villageId;
    if (!villageId) throw new ApiError(400, 'Please select a village for this complaint');
    assertObjectId(villageId, 'village id');
    const village = await Village.findById(villageId).select('_id');
    if (!village) throw new ApiError(404, 'Village not found');
  }

  const ticketCode = await generateTicketCode();
  const complaint = await Complaint.create({
    villageId,
    citizenId: req.user._id,
    ticketCode,
    title: String(title).trim(),
    category,
    description: String(description || '').trim(),
    status: 'Pending',
  });

  const hydrated = await populateSafe(Complaint.findById(complaint._id)).lean();
  return sendSuccess(res, { complaint: hydrated }, 'Complaint submitted successfully', 201);
});





const listComplaints = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const scope = baseScope(req);
  const filter = { ...scope };

  if (req.query.status) {
    if (!COMPLAINT_STATUSES.includes(req.query.status)) throw new ApiError(400, 'Invalid complaint status filter');
    filter.status = req.query.status;
  }
  if (req.query.category) {
    if (!COMPLAINT_CATEGORIES.includes(req.query.category)) {
      throw new ApiError(400, 'Invalid complaint category filter');
    }
    filter.category = req.query.category;
  }
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
    filter.$or = [{ title: rx }, { ticketCode: rx }, { description: rx }];
  }

  const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : { updatedAt: -1 };

  const [complaints, total, statusGroups, categoryGroups] = await Promise.all([
    populateSafe(Complaint.find(filter))
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Complaint.countDocuments(filter),
    Complaint.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $match: scope }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  const byStatus = Object.fromEntries(COMPLAINT_STATUSES.map((status) => [status, 0]));
  let totalComplaints = 0;
  statusGroups.forEach((group) => {
    byStatus[group._id] = group.count;
    totalComplaints += group.count;
  });
  const byCategory = Object.fromEntries(COMPLAINT_CATEGORIES.map((category) => [category, 0]));
  categoryGroups.forEach((group) => {
    byCategory[group._id] = group.count;
  });

  return sendSuccess(
    res,
    {
      complaints,
      summary: {
        total: totalComplaints,
        byStatus,
        byCategory,
        resolutionRate: totalComplaints
          ? Math.round((byStatus.Resolved / totalComplaints) * 100)
          : 0,
      },
    },
    'Complaints fetched successfully',
    200,
    buildMeta({ page, limit, total })
  );
});





const trackComplaint = catchAsync(async (req, res) => {
  const code = String(req.params.ticketCode || '').trim().toUpperCase();
  if (!code) throw new ApiError(400, 'Ticket ID is required');

  const complaint = await Complaint.findOne({ ticketCode: code })
    .select(
      'ticketCode title category description status resolutionNote createdAt updatedAt resolvedAt villageId'
    )
    .populate('villageId', 'name district state')
    .lean();

  if (!complaint) throw new ApiError(404, 'No complaint found for this ticket ID');

  return sendSuccess(
    res,
    {
      complaint: {
        ticketCode: complaint.ticketCode,
        title: complaint.title,
        category: complaint.category,
        description: complaint.description,
        status: complaint.status,
        resolutionNote: complaint.resolutionNote,
        village: complaint.villageId,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        resolvedAt: complaint.resolvedAt,
      },
    },
    'Complaint status fetched successfully'
  );
});

const assertComplaintAccess = (user, complaint) => {
  if (user.role === 'Village Officer') {
    const assigned = assignedVillageId(user);
    if (String(assigned) !== String(complaint.villageId?._id || complaint.villageId)) {
      throw new ApiError(403, 'Village scope violation: you can only access complaints from your village');
    }
  } else if (String(complaint.citizenId?._id || complaint.citizenId) !== String(user._id)) {
    throw new ApiError(403, 'You can only access your own complaints');
  }
};




const getComplaint = catchAsync(async (req, res) => {
  assertObjectId(req.params.id, 'complaint id');
  const complaint = await populateSafe(Complaint.findById(req.params.id)).lean();
  if (!complaint) throw new ApiError(404, 'Complaint not found');
  assertComplaintAccess(req.user, complaint);
  return sendSuccess(res, { complaint });
});





const updateComplaintStatus = catchAsync(async (req, res) => {
  assertObjectId(req.params.id, 'complaint id');

  const { status, resolutionNote } = req.body;
  if (!status || !COMPLAINT_STATUSES.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${COMPLAINT_STATUSES.join(', ')}`);
  }
  if (resolutionNote !== undefined && String(resolutionNote).length > 1000) {
    throw new ApiError(400, 'Resolution note cannot exceed 1000 characters');
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, 'Complaint not found');

  if (String(assignedVillageId(req.user)) !== String(complaint.villageId)) {
    throw new ApiError(403, 'Village scope violation: you can only update complaints from your village');
  }

  complaint.status = status;
  if (resolutionNote !== undefined) complaint.resolutionNote = String(resolutionNote).trim();
  complaint.resolvedAt = status === 'Resolved' ? complaint.resolvedAt || new Date() : null;
  await complaint.save();

  const hydrated = await populateSafe(Complaint.findById(complaint._id)).lean();
  return sendSuccess(res, { complaint: hydrated }, 'Complaint status updated successfully');
});

module.exports = {
  createComplaint,
  listComplaints,
  getComplaint,
  trackComplaint,
  updateComplaintStatus,
};
