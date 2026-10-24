const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, buildMeta } = require('../utils/response');
const { escapeRegex } = require('../utils/validate');






const listUsers = catchAsync(async (req, res) => {
  const villageId = req.user.villageId?._id || req.user.villageId;
  if (!villageId) throw new ApiError(403, 'No village is assigned to your account');

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
  const filter = { villageId };

  if (req.query.role && ['Village Officer', 'Citizen'].includes(req.query.role)) {
    filter.role = req.query.role;
  }
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total, groups] = await Promise.all([
    User.find(filter)
      .select('name email role phone villageId createdAt')
      .sort({ role: 1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
    User.aggregate([
      { $match: { villageId } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
  ]);

  const summary = { total: 0, officers: 0, citizens: 0 };
  groups.forEach((group) => {
    summary.total += group.count;
    if (group._id === 'Village Officer') summary.officers = group.count;
    if (group._id === 'Citizen') summary.citizens = group.count;
  });

  return sendSuccess(
    res,
    { users, summary },
    'Users fetched successfully',
    200,
    buildMeta({ page, limit, total })
  );
});

module.exports = { listUsers };
