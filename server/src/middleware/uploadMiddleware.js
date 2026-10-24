const path = require('path');
const multer = require('multer');

const ALLOWED_EXTENSIONS = new Set(['.csv', '.xlsx', '.xls']);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Only CSV, XLS and XLSX files are supported'));
    }
    return cb(null, true);
  },
});

module.exports = upload;
