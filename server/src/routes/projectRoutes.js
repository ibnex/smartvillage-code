const express = require('express');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { optionalAuth, protect, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, listProjects);
router.get('/:id', optionalAuth, getProject);

router.post('/', protect, authorizeRole('Village Officer'), createProject);
router.patch('/:id', protect, authorizeRole('Village Officer'), updateProject);
router.delete('/:id', protect, authorizeRole('Village Officer'), deleteProject);

module.exports = router;
