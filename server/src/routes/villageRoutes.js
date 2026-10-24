const express = require('express');
const { listVillages, getVillage, updateVillage } = require('../controllers/villageController');
const { optionalAuth, protect, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, listVillages);
router.get('/:id', optionalAuth, getVillage);
router.patch('/:id', protect, authorizeRole('Village Officer'), updateVillage);

module.exports = router;
