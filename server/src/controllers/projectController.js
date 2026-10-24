const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, buildMeta } = require('../utils/response');
const { assertObjectId, escapeRegex, parseNumber, pickDefined } = require('../utils/validate');

const PROJECT_STATUSES = Project.STATUSES;
const PROJECT_CATEGORIES = Project.CATEGORIES;

const assignedVillageId = (user) => user?.villageId?._id || user?.villageId || null;

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 8));
  return { page, limit };
};

const buildScope = (req) => {
  if (req.user?.role === 'Village Officer') {
    const assigned = assignedVillageId(req.user);
    if (!assigned) throw new ApiError(403, 'No village is assigned to your account');
    return { villageId: assigned };
  }
  if (req.query.villageId) {
    assertObjectId(req.query.villageId, 'village id');
    return { villageId: req.query.villageId };
  }
  return {};
};

const summaryFor = async (scope) => {
  const groups = await Project.aggregate([
    { $match: scope },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        budget: { $sum: '$budget' },
        avgProgress: { $avg: '$progress' },
      },
    },
  ]);

  const byStatus = Object.fromEntries(PROJECT_STATUSES.map((status) => [status, 0]));
  let total = 0;
  let totalBudget = 0;
  let completedBudget = 0;
  let weightedProgress = 0;
  groups.forEach((group) => {
    if (!PROJECT_STATUSES.includes(group._id)) return;
    byStatus[group._id] = group.count;
    total += group.count;
    totalBudget += group.budget || 0;
    if (group._id === 'Completed') completedBudget += group.budget || 0;
    weightedProgress += (group.avgProgress || 0) * group.count;
  });

  return {
    total,
    byStatus,
    totalBudget,
    completedBudget,
    averageProgress: total ? Math.round(weightedProgress / total) : 0,
    completionRate: total ? Math.round((byStatus.Completed / total) * 100) : 0,
  };
};





const listProjects = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const scope = buildScope(req);
  const filter = { ...scope };

  if (req.query.status) {
    if (!PROJECT_STATUSES.includes(req.query.status)) throw new ApiError(400, 'Invalid project status filter');
    filter.status = req.query.status;
  }
  if (req.query.category) {
    if (!PROJECT_CATEGORIES.includes(req.query.category)) {
      throw new ApiError(400, 'Invalid project category filter');
    }
    filter.category = req.query.category;
  }
  if (req.query.search) {
    filter.name = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
  }

  const sortMap = {
    newest: { updatedAt: -1 },
    oldest: { updatedAt: 1 },
    progress: { progress: -1 },
    budget: { budget: -1 },
    name: { name: 1 },
  };
  const sort = sortMap[req.query.sort] || sortMap.newest;

  const [projects, total, summary] = await Promise.all([
    Project.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
    summaryFor(scope),
  ]);

  return sendSuccess(
    res,
    { projects, summary },
    'Projects fetched successfully',
    200,
    buildMeta({ page, limit, total })
  );
});




const getProject = catchAsync(async (req, res) => {
  assertObjectId(req.params.id, 'project id');
  const project = await Project.findById(req.params.id)
    .populate('villageId', 'name district state villageCode')
    .lean();
  if (!project) throw new ApiError(404, 'Project not found');

  if (req.user?.role === 'Village Officer') {
    const assigned = assignedVillageId(req.user);
    const projectVillage = project.villageId?._id || project.villageId;
    if (String(assigned) !== String(projectVillage)) {
      throw new ApiError(403, 'Village scope violation: you can only access your assigned village');
    }
  }

  return sendSuccess(res, { project });
});

const validateProjectPayload = (body, { partial = false } = {}) => {
  const data = {};

  if (body.name !== undefined) {
    if (!String(body.name).trim()) throw new ApiError(400, 'Project name is required');
    data.name = String(body.name).trim();
  } else if (!partial) {
    throw new ApiError(400, 'Project name is required');
  }

  if (body.category !== undefined) {
    if (!PROJECT_CATEGORIES.includes(body.category)) {
      throw new ApiError(400, `Category must be one of: ${PROJECT_CATEGORIES.join(', ')}`);
    }
    data.category = body.category;
  } else if (!partial) {
    throw new ApiError(400, 'Project category is required');
  }

  if (body.budget !== undefined) {
    data.budget = parseNumber(body.budget, 'Budget', { min: 0, required: true });
  } else if (!partial) {
    throw new ApiError(400, 'Project budget is required');
  }

  if (body.progress !== undefined) {
    data.progress = parseNumber(body.progress, 'Progress', { min: 0, max: 100, required: true });
  } else if (!partial) {
    data.progress = 0;
  }

  if (body.status !== undefined) {
    if (!PROJECT_STATUSES.includes(body.status)) {
      throw new ApiError(400, `Status must be one of: ${PROJECT_STATUSES.join(', ')}`);
    }
    data.status = body.status;
  } else if (!partial) {
    data.status = 'Planned';
  }

  if (body.description !== undefined) {
    if (String(body.description).length > 1000) {
      throw new ApiError(400, 'Description cannot exceed 1000 characters');
    }
    data.description = String(body.description).trim();
  }

  if (data.status === 'Completed') data.progress = 100;
  return data;
};




const createProject = catchAsync(async (req, res) => {
  if (!assignedVillageId(req.user)) throw new ApiError(403, 'No village is assigned to your account');

  const data = validateProjectPayload(req.body);
  const project = await Project.create({ ...data, villageId: assignedVillageId(req.user) });

  return sendSuccess(res, { project }, 'Project created successfully', 201);
});




const updateProject = catchAsync(async (req, res) => {
  assertObjectId(req.params.id, 'project id');
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (String(assignedVillageId(req.user)) !== String(project.villageId)) {
    throw new ApiError(403, 'Village scope violation: you can only edit projects in your assigned village');
  }

  const data = validateProjectPayload(req.body, { partial: true });
  if (!Object.keys(data).length) throw new ApiError(400, 'No valid fields provided for update');

  Object.assign(project, data);
  await project.save();

  return sendSuccess(res, { project }, 'Project updated successfully');
});




const deleteProject = catchAsync(async (req, res) => {
  assertObjectId(req.params.id, 'project id');
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (String(assignedVillageId(req.user)) !== String(project.villageId)) {
    throw new ApiError(403, 'Village scope violation: you can only delete projects in your assigned village');
  }

  await project.deleteOne();
  return sendSuccess(res, { id: req.params.id }, 'Project deleted successfully');
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  pickDefined,
};
