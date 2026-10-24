const Village = require('../models/Village');
const VillageStatistics = require('../models/VillageStatistics');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { assertObjectId, escapeRegex, pickDefined, parseNumber } = require('../utils/validate');

const assignedVillageId = (user) => user?.villageId?._id || user?.villageId || null;






const listVillages = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user?.role === 'Village Officer') {
    if (!assignedVillageId(req.user)) throw new ApiError(403, 'No village is assigned to your account');
    filter._id = assignedVillageId(req.user);
  }

  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: rx }, { district: rx }, { state: rx }, { villageCode: rx }];
  }

  const villages = await Village.find(filter).sort({ name: 1 }).lean();
  return sendSuccess(res, { villages });
});





const getVillage = catchAsync(async (req, res) => {
  assertObjectId(req.params.id, 'village id');

  const village = await Village.findById(req.params.id).lean();
  if (!village) throw new ApiError(404, 'Village not found');

  if (
    req.user?.role === 'Village Officer' &&
    String(assignedVillageId(req.user)) !== String(village._id)
  ) {
    throw new ApiError(403, 'Village scope violation: you can only access your assigned village');
  }

  const statistics = await VillageStatistics.findOne({ villageId: village._id }).lean();
  return sendSuccess(res, { village, statistics });
});





const updateVillage = catchAsync(async (req, res) => {
  const villageId = assertObjectId(req.params.id, 'village id');
  if (String(assignedVillageId(req.user)) !== String(villageId)) {
    throw new ApiError(403, 'Village scope violation: you can only edit your assigned village');
  }

  const village = await Village.findById(villageId);
  if (!village) throw new ApiError(404, 'Village not found');

  const fields = pickDefined(req.body, [
    'name',
    'district',
    'state',
    'villageCode',
    'households',
    'areaSqKm',
  ]);

  ['name', 'district', 'state', 'villageCode'].forEach((key) => {
    if (fields[key] !== undefined) {
      if (!String(fields[key]).trim()) throw new ApiError(400, `${key} cannot be empty`);
      fields[key] = String(fields[key]).trim();
      if (key === 'villageCode') fields[key] = fields[key].toUpperCase();
    }
  });

  if (fields.households !== undefined) {
    fields.households = parseNumber(fields.households, 'Households', { min: 0 });
  }
  if (fields.areaSqKm !== undefined) {
    fields.areaSqKm = parseNumber(fields.areaSqKm, 'Area', { min: 0 });
  }

  if (req.body.location !== undefined) {
    const lat = req.body.location?.lat;
    const lng = req.body.location?.lng;
    fields.location = {
      lat: lat === '' || lat === null || lat === undefined ? null : parseNumber(lat, 'Latitude', { min: -90, max: 90 }),
      lng: lng === '' || lng === null || lng === undefined ? null : parseNumber(lng, 'Longitude', { min: -180, max: 180 }),
    };
  }

  if (!Object.keys(fields).length) throw new ApiError(400, 'No valid fields provided for update');

  Object.assign(village, fields);
  await village.save();

  return sendSuccess(res, { village }, 'Village profile updated successfully');
});

module.exports = { listVillages, getVillage, updateVillage };
