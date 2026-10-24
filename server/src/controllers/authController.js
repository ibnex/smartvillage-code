const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Village = require('../models/Village');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { isValidObjectId } = require('../utils/validate');
const { signToken } = require('../middleware/authMiddleware');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = async (user) => {
  const populated = await user.populate(
    'villageId',
    'name district state villageCode households areaSqKm location'
  );
  return populated;
};

const buildAuthPayload = async (user) => {
  const hydrated = await publicUser(user);
  return {
    token: signToken(hydrated),
    user: hydrated.toJSON(),
  };
};






const register = catchAsync(async (req, res) => {
  const { name, email, password, phone = '', villageId = null } = req.body;

  if (!name || !String(name).trim()) throw new ApiError(400, 'Name is required');
  if (String(name).trim().length < 2) throw new ApiError(400, 'Name must be at least 2 characters');
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    throw new ApiError(400, 'A valid email address is required');
  }
  if (!password || String(password).length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }
  if (villageId && !isValidObjectId(villageId)) throw new ApiError(400, 'Invalid village selection');

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  if (villageId) {
    const village = await Village.findById(villageId);
    if (!village) throw new ApiError(404, 'The selected village was not found');
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'Citizen',
    villageId: villageId || null,
    phone: String(phone || '').trim(),
  });

  const payload = await buildAuthPayload(user);
  return sendSuccess(res, payload, 'Account created successfully', 201);
});




const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
    '+passwordHash'
  );
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const matches = await bcrypt.compare(String(password), user.passwordHash);
  if (!matches) throw new ApiError(401, 'Invalid email or password');

  const payload = await buildAuthPayload(user);
  return sendSuccess(res, payload, 'Signed in successfully');
});




const getMe = catchAsync(async (req, res) => {
  const user = await publicUser(req.user);
  return sendSuccess(res, { user: user.toJSON() });
});




const updateMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'Account not found');

  const { name, email, phone, villageId } = req.body;
  if (name !== undefined) {
    if (!String(name).trim() || String(name).trim().length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters');
    }
    user.name = String(name).trim();
  }
  if (email !== undefined) {
    const normalized = String(email).toLowerCase().trim();
    if (!EMAIL_RE.test(normalized)) throw new ApiError(400, 'A valid email address is required');
    if (normalized !== user.email) {
      const duplicate = await User.findOne({ email: normalized, _id: { $ne: user._id } });
      if (duplicate) throw new ApiError(409, 'An account with this email already exists');
      user.email = normalized;
    }
  }
  if (phone !== undefined) user.phone = String(phone).trim();
  if (villageId !== undefined && user.role === 'Citizen') {
    if (villageId && !isValidObjectId(villageId)) throw new ApiError(400, 'Invalid village selection');
    if (villageId) {
      const village = await Village.findById(villageId);
      if (!village) throw new ApiError(404, 'The selected village was not found');
    }
    user.villageId = villageId || null;
  }

  await user.save();
  const payload = await buildAuthPayload(user);
  return sendSuccess(res, payload, 'Profile updated successfully');
});




const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }
  if (String(newPassword).length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long');
  }
  if (String(currentPassword) === String(newPassword)) {
    throw new ApiError(400, 'New password must be different from the current password');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) throw new ApiError(404, 'Account not found');

  const matches = await bcrypt.compare(String(currentPassword), user.passwordHash);
  if (!matches) throw new ApiError(401, 'Current password is incorrect');

  user.passwordHash = await bcrypt.hash(String(newPassword), 12);
  await user.save();

  return sendSuccess(res, null, 'Password updated successfully');
});






const logout = catchAsync(async (_req, res) => {
  return sendSuccess(res, null, 'Signed out successfully');
});

module.exports = { register, login, getMe, updateMe, changePassword, logout };
