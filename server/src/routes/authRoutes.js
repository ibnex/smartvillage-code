const express = require('express');
const { register, login, getMe, updateMe, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

router.use(protect);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/password', changePassword);
router.post('/logout', logout);

module.exports = router;
