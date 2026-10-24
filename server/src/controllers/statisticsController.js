const Village = require('../models/Village');
const VillageStatistics = require('../models/VillageStatistics');
const Project = require('../models/Project');
const Complaint = require('../models/Complaint');
const ImportLog = require('../models/ImportLog');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { assertObjectId, parseNumber } = require('../utils/validate');

const PROJECT_STATUSES = ['Planned', 'Ongoing', 'Completed', 'On Hold'];
const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved'];
const SECTORS = ['agriculture', 'education', 'healthcare', 'sanitation', 'housing'];

const ensureVillageAccess = (user, villageId) => {
  if (user?.role === 'Village Officer') {
    const assigned = user.villageId?._id || user.villageId;
    if (!assigned || String(assigned) !== String(villageId)) {
      throw new ApiError(403, 'Village scope violation: you can only access your assigned village');
    }
  }
};

const getVillageOrThrow = async (villageId, user) => {
  assertObjectId(villageId, 'village id');
  ensureVillageAccess(user, villageId);
  const village = await Village.findById(villageId).lean();
  if (!village) throw new ApiError(404, 'Village not found');
  return village;
};

const emptyProjectSummary = () => ({
  total: 0,
  byStatus: Object.fromEntries(PROJECT_STATUSES.map((status) => [status, 0])),
  totalBudget: 0,
  completedBudget: 0,
  averageProgress: 0,
  completionRate: 0,
});

const emptyComplaintSummary = () => ({
  total: 0,
  byStatus: Object.fromEntries(COMPLAINT_STATUSES.map((status) => [status, 0])),
});





const getDashboard = catchAsync(async (req, res) => {
  const { villageId } = req.params;
  const village = await getVillageOrThrow(villageId, req.user);

  const [statisticsDoc, projectGroups, recentProjects, complaintGroups, recentComplaints, imports, citizenCount] =
    await Promise.all([
      VillageStatistics.findOne({ villageId: village._id }).lean(),
      Project.aggregate([
        { $match: { villageId: village._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            budget: { $sum: '$budget' },
            avgProgress: { $avg: '$progress' },
          },
        },
      ]),
      Project.find({ villageId: village._id }).sort({ updatedAt: -1 }).limit(5).lean(),
      Complaint.aggregate([
        { $match: { villageId: village._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            resolvedAvgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } },
          },
        },
      ]),
      Complaint.find({ villageId: village._id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('citizenId', 'name')
        .lean(),
      ImportLog.find({ villageId: village._id }).sort({ timestamp: -1 }).limit(3).lean(),
      User.countDocuments({ villageId: village._id, role: 'Citizen' }),
    ]);

  const statistics = statisticsDoc || {
    villageId: village._id,
    population: 0,
    waterCoverage: 0,
    electricityCoverage: 0,
    roadConnectivity: 0,
    sectorMetrics: Object.fromEntries(SECTORS.map((sector) => [sector, 0])),
  };

  const projects = emptyProjectSummary();
  let weightedProgress = 0;
  projectGroups.forEach((group) => {
    if (!PROJECT_STATUSES.includes(group._id)) return;
    projects.byStatus[group._id] = group.count;
    projects.total += group.count;
    projects.totalBudget += group.budget || 0;
    if (group._id === 'Completed') projects.completedBudget += group.budget || 0;
    weightedProgress += (group.avgProgress || 0) * group.count;
  });
  projects.averageProgress = projects.total ? Math.round(weightedProgress / projects.total) : 0;
  projects.completionRate = projects.total
    ? Math.round((projects.byStatus.Completed / projects.total) * 100)
    : 0;

  const complaints = emptyComplaintSummary();
  let resolutionMs = 0;
  let resolvedCount = 0;
  complaintGroups.forEach((group) => {
    if (!COMPLAINT_STATUSES.includes(group._id)) return;
    complaints.byStatus[group._id] = group.count;
    complaints.total += group.count;
    if (group._id === 'Resolved') {
      resolvedCount += group.count;
      resolutionMs += (group.resolvedAvgMs || 0) * group.count;
    }
  });
  complaints.resolutionRate = complaints.total
    ? Math.round((resolvedCount / complaints.total) * 100)
    : 0;
  complaints.averageResolutionDays =
    resolvedCount && resolutionMs ? Number((resolutionMs / resolvedCount / 86400000).toFixed(1)) : 0;

  const activities = [];
  recentProjects.forEach((project) => {
    const isNew = project.createdAt && project.updatedAt
      ? Math.abs(new Date(project.updatedAt) - new Date(project.createdAt)) < 1000 * 60 * 30
      : false;
    activities.push({
      id: `project-${project._id}`,
      type: isNew ? 'project_added' : 'project_updated',
      title: isNew ? 'New project added' : 'Project status updated',
      description: `${project.name} · ${project.progress}% complete`,
      timestamp: project.updatedAt,
    });
  });
  recentComplaints.forEach((complaint) => {
    const type =
      complaint.status === 'Resolved'
        ? 'complaint_resolved'
        : complaint.status === 'In Progress'
          ? 'complaint_progress'
          : 'complaint_new';
    activities.push({
      id: `complaint-${complaint._id}`,
      type,
      title:
        type === 'complaint_resolved'
          ? 'Complaint resolved'
          : type === 'complaint_progress'
            ? 'Complaint in progress'
            : 'New complaint submitted',
      description: `${complaint.title} · ${complaint.category}`,
      timestamp: complaint.updatedAt,
    });
  });
  imports.forEach((log) => {
    activities.push({
      id: `import-${log._id}`,
      type: log.status === 'Failed' ? 'import_failed' : 'import',
      title: log.status === 'Failed' ? 'Data import failed' : 'Data imported',
      description: `${log.fileName} · ${log.recordsCount} record${log.recordsCount === 1 ? '' : 's'}`,
      timestamp: log.timestamp,
    });
  });
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return sendSuccess(res, {
    village,
    statistics,
    projects: { ...projects, recent: recentProjects },
    complaints: { ...complaints, recent: recentComplaints },
    activities: activities.slice(0, 7),
    users: { citizens: citizenCount },
  });
});





const getReports = catchAsync(async (req, res) => {
  const { villageId } = req.params;
  const village = await getVillageOrThrow(villageId, req.user);

  const [statisticsDoc, projects, complaints, importLogs] = await Promise.all([
    VillageStatistics.findOne({ villageId: village._id }).lean(),
    Project.find({ villageId: village._id }).lean(),
    Complaint.find({ villageId: village._id }).lean(),
    ImportLog.find({ villageId: village._id }).sort({ timestamp: -1 }).limit(5).lean(),
  ]);

  const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const completedBudget = projects
    .filter((project) => project.status === 'Completed')
    .reduce((sum, project) => sum + (project.budget || 0), 0);
  const totalProgress = projects.reduce((sum, project) => sum + (project.progress || 0), 0);

  const byStatus = Object.fromEntries(PROJECT_STATUSES.map((status) => [status, 0]));
  const byCategory = {};
  projects.forEach((project) => {
    byStatus[project.status] = (byStatus[project.status] || 0) + 1;
    byCategory[project.category] = (byCategory[project.category] || 0) + (project.budget || 0);
  });

  const complaintByStatus = Object.fromEntries(COMPLAINT_STATUSES.map((status) => [status, 0]));
  const complaintByCategory = {};
  complaints.forEach((complaint) => {
    complaintByStatus[complaint.status] = (complaintByStatus[complaint.status] || 0) + 1;
    complaintByCategory[complaint.category] = (complaintByCategory[complaint.category] || 0) + 1;
  });

  const resolved = complaints.filter((complaint) => complaint.status === 'Resolved' && complaint.resolvedAt);
  const avgResolutionDays = resolved.length
    ? Number(
        (
          resolved.reduce(
            (sum, complaint) => sum + (new Date(complaint.resolvedAt) - new Date(complaint.createdAt)),
            0
          ) /
          resolved.length /
          86400000
        ).toFixed(1)
      )
    : 0;

  const monthKeys = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthKeys.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('en-US', { month: 'short' }),
    });
  }
  const monthly = monthKeys.map(({ key, label }) => {
    const submitted = complaints.filter((complaint) => {
      const date = new Date(complaint.createdAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === key;
    }).length;
    const resolvedInMonth = resolved.filter((complaint) => {
      const date = new Date(complaint.resolvedAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === key;
    }).length;
    const projectsUpdated = projects.filter((project) => {
      const date = new Date(project.updatedAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === key;
    }).length;
    return { month: label, key, submitted, resolved: resolvedInMonth, projectUpdates: projectsUpdated };
  });

  return sendSuccess(res, {
    village,
    statistics: statisticsDoc || null,
    summary: {
      totalProjects: projects.length,
      totalBudget,
      completedBudget,
      averageProgress: projects.length ? Math.round(totalProgress / projects.length) : 0,
      completionRate: projects.length
        ? Math.round((byStatus.Completed / projects.length) * 100)
        : 0,
      totalComplaints: complaints.length,
      resolvedComplaints: complaintByStatus.Resolved,
      resolutionRate: complaints.length
        ? Math.round((complaintByStatus.Resolved / complaints.length) * 100)
        : 0,
      avgResolutionDays,
      budgetUtilisation: totalBudget
        ? Math.round((completedBudget / totalBudget) * 100)
        : 0,
    },
    projects: { byStatus, byCategory, total: projects.length },
    complaints: { byStatus: complaintByStatus, byCategory: complaintByCategory, total: complaints.length },
    monthly,
    statisticsSectors: statisticsDoc?.sectorMetrics || Object.fromEntries(SECTORS.map((sector) => [sector, 0])),
    recentImports: importLogs,
  });
});




const getStatistics = catchAsync(async (req, res) => {
  const { villageId } = req.params;
  const village = await getVillageOrThrow(villageId, req.user);
  const statistics = await VillageStatistics.findOne({ villageId: village._id }).lean();
  if (!statistics) throw new ApiError(404, 'Statistics have not been recorded for this village yet');
  return sendSuccess(res, { statistics });
});

const readPercentage = (value, field) => {
  if (value === undefined || value === null || value === '') return undefined;
  return parseNumber(value, field, { min: 0, max: 100 });
};





const updateStatistics = catchAsync(async (req, res) => {
  const { villageId } = req.params;
  const village = await getVillageOrThrow(villageId, req.user);

  let statistics = await VillageStatistics.findOne({ villageId: village._id });
  if (!statistics) statistics = new VillageStatistics({ villageId: village._id });

  if (req.body.population !== undefined) {
    statistics.population = parseNumber(req.body.population, 'Population', { min: 0 });
  }
  const directFields = ['waterCoverage', 'electricityCoverage', 'roadConnectivity'];
  directFields.forEach((field) => {
    const parsed = readPercentage(req.body[field], field);
    if (parsed !== undefined) statistics[field] = parsed;
  });

  const incomingSectors = req.body.sectorMetrics || {};
  const sectors = statistics.sectorMetrics?.toObject
    ? statistics.sectorMetrics.toObject()
    : { ...(statistics.sectorMetrics || {}) };
  SECTORS.forEach((sector) => {
    const parsed = readPercentage(incomingSectors[sector], `sectorMetrics.${sector}`);
    if (parsed !== undefined) sectors[sector] = parsed;
  });
  statistics.sectorMetrics = sectors;

  await statistics.save();
  return sendSuccess(res, { statistics }, 'Village statistics updated successfully');
});

module.exports = {
  getDashboard,
  getReports,
  getStatistics,
  updateStatistics,
};
