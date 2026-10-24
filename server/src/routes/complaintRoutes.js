const express = require('express');
const {
  createComplaint,
  listComplaints,
  getComplaint,
  trackComplaint,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/track/:ticketCode', trackComplaint);

router.use(protect);
router.post('/', createComplaint);
router.get('/', listComplaints);
router.get('/:id', getComplaint);
router.patch('/:id', authorizeRole('Village Officer'), updateComplaintStatus);

module.exports = router;
