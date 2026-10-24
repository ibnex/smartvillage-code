const express = require('express');
const {
  getDashboard,
  getReports,
  getStatistics,
  updateStatistics,
} = require('../controllers/statisticsController');
const { optionalAuth, protect, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard/:villageId', optionalAuth, getDashboard);
router.get('/reports/:villageId', optionalAuth, getReports);
router.get('/:villageId', optionalAuth, getStatistics);
router.put('/:villageId', protect, authorizeRole('Village Officer'), updateStatistics);

module.exports = router;
