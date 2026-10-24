const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }
};

const loadUser = async (payload) => {
  const user = await User.findById(payload.userId).populate(
    'villageId',
    'name district state villageCode households areaSqKm location'
  );
  if (!user) throw new ApiError(401, 'The account linked to this session no longer exists.');
  return user;
};




const protect = catchAsync(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, 'Authentication required. Please sign in.');

  const payload = verifyToken(token);
  const user = await loadUser(payload);

  req.user = user;
  req.token = token;
  next();
});






const optionalAuth = catchAsync(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  const payload = verifyToken(token);
  req.user = await loadUser(payload);
  req.token = token;
  return next();
});




const authorizeRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required.'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }
  return next();
};

const getRequestedVillageId = (req) => {
  const fromParams = req.params?.villageId;
  const fromQuery = req.query?.villageId;
  const fromBody = req.body?.villageId;
  return fromParams || fromQuery || fromBody || null;
};







const enforceVillageScope = (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required.'));

  const requested = getRequestedVillageId(req);

  if (req.user.role === 'Village Officer') {
    const assigned = req.user.villageId?._id || req.user.villageId;
    if (!assigned) {
      return next(new ApiError(403, 'No village is assigned to your account. Contact an administrator.'));
    }
    if (requested && String(requested) !== String(assigned)) {
      return next(new ApiError(403, 'Village scope violation: you can only access your assigned village.'));
    }
    req.villageScopeId = assigned;
  } else {
    req.villageScopeId = requested || req.user.villageId?._id || req.user.villageId || null;
  }

  return next();
};

const signToken = (user) =>
  jwt.sign(
    {
      userId: String(user._id),
      role: user.role,
      villageId: user.villageId?._id ? String(user.villageId._id) : user.villageId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

module.exports = {
  protect,
  optionalAuth,
  authorizeRole,
  enforceVillageScope,
  signToken,
};
