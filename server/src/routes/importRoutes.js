const express = require('express');
const { importData, listImportLogs, downloadTemplate } = require('../controllers/importController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/template', downloadTemplate);

router.use(protect, authorizeRole('Village Officer'));
router.post('/', upload.single('file'), importData);
router.get('/logs', listImportLogs);

module.exports = router;
