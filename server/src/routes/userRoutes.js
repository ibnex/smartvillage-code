const express = require('express');
const { listUsers } = require('../controllers/userController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRole('Village Officer'), listUsers);

module.exports = router;
