const path = require('path');
const XLSX = require('xlsx');
const ImportLog = require('../models/ImportLog');
const Project = require('../models/Project');
const Village = require('../models/Village');
const VillageStatistics = require('../models/VillageStatistics');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, buildMeta } = require('../utils/response');
const { parseNumber } = require('../utils/validate');

const PROJECT_CATEGORIES = Project.CATEGORIES;
const PROJECT_STATUSES = Project.STATUSES;

const SECTOR_FIELDS = ['agriculture', 'education', 'healthcare', 'sanitation', 'housing'];

const normalizeKey = (key) => String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const normalizeRow = (raw) => {
  const row = {};
  Object.entries(raw).forEach(([key, value]) => {
    row[normalizeKey(key)] = typeof value === 'string' ? value.trim() : value;
  });
  return row;
};

const getValue = (row, aliases) => {
  for (const alias of aliases) {
    const key = normalizeKey(alias);
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
};

const parseAmount = (value) => {
  if (typeof value === 'number') return value;
  const cleaned = String(value)
    .replace(/[₹$€£,\s%]/g, '')
    .trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
};

const resolveEnum = (value, values) => {
  const normalized = normalizeKey(value);
  return values.find((item) => normalizeKey(item) === normalized) || null;
};

const parseWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  if (!workbook.SheetNames.length) throw new ApiError(400, 'The workbook does not contain any sheets');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, blankrows: false });
  return rawRows.map(normalizeRow);
};

const failureResponse = async (res, log, message, errors = []) => {
  const errorLines = errors.map((error) => `Row ${error.row}: ${error.message}`);
  log.status = 'Failed';
  log.recordsCount = 0;
  log.errorSummary = (errorLines.slice(0, 12).join(' | ') || message).slice(0, 2000);
  await log.save();
  return res.status(422).json({
    success: false,
    message,
    details: { errors: errors.slice(0, 20), log },
  });
};

const summarizeWarnings = (errors, duplicates) => {
  const parts = [];
  if (errors.length) {
    parts.push(
      `${errors.length} row${errors.length === 1 ? '' : 's'} failed validation: ` +
        errors
          .slice(0, 6)
          .map((error) => `row ${error.row} ${error.message}`)
          .join(', ')
    );
  }
  if (duplicates) {
    parts.push(`${duplicates} duplicate project row${duplicates === 1 ? '' : 's'} skipped`);
  }
  return parts.join(' | ').slice(0, 2000);
};

const importProjects = async (res, rows, villageId, log) => {
  const existing = await Project.find({ villageId }).select('name').lean();
  const existingNames = new Set(existing.map((project) => project.name.trim().toLowerCase()));
  const seenNames = new Set();

  const validDocs = [];
  const errors = [];
  let duplicates = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const name = String(getValue(row, ['name', 'project name', 'project'])).trim();
    const categoryRaw = getValue(row, ['category', 'project category']);
    const budgetRaw = getValue(row, ['budget', 'estimated budget', 'amount']);
    const progressRaw = getValue(row, ['progress', 'completion', 'progress %']);
    const statusRaw = getValue(row, ['status', 'project status']);

    if (!name) {
      errors.push({ row: rowNumber, message: 'name is required' });
      return;
    }
    const category = resolveEnum(categoryRaw, PROJECT_CATEGORIES);
    if (!category) {
      errors.push({
        row: rowNumber,
        message: `category must be one of ${PROJECT_CATEGORIES.join(', ')}`,
      });
      return;
    }

    const budget = parseAmount(budgetRaw);
    if (!Number.isFinite(budget) || budget < 0) {
      errors.push({ row: rowNumber, message: 'budget must be a non-negative number' });
      return;
    }

    const progress = parseAmount(progressRaw);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      errors.push({ row: rowNumber, message: 'progress must be a number between 0 and 100' });
      return;
    }

    let status = 'Planned';
    if (statusRaw !== '') {
      status = resolveEnum(statusRaw, PROJECT_STATUSES);
      if (!status) {
        errors.push({
          row: rowNumber,
          message: `status must be one of ${PROJECT_STATUSES.join(', ')}`,
        });
        return;
      }
    }

    const normalizedName = name.toLowerCase();
    if (existingNames.has(normalizedName) || seenNames.has(normalizedName)) {
      duplicates += 1;
      return;
    }
    seenNames.add(normalizedName);

    validDocs.push({
      villageId,
      name,
      category,
      budget,
      progress: status === 'Completed' ? 100 : Math.round(progress),
      status,
      description: String(getValue(row, ['description', 'details', 'notes']) || '').slice(0, 1000),
    });
  });

  const warningSummary = summarizeWarnings(errors, duplicates);

  if (!validDocs.length) {
    return failureResponse(
      res,
      log,
      errors.length
        ? 'No valid project rows were found. Please correct the highlighted fields and retry.'
        : 'No new projects were imported. All rows were duplicates of existing projects.',
      errors
    );
  }

  const inserted = await Project.insertMany(validDocs, { ordered: false });

  log.status = 'Success';
  log.recordsCount = inserted.length;
  log.errorSummary = warningSummary;
  await log.save();

  return sendSuccess(
    res,
    {
      log,
      summary: {
        inserted: inserted.length,
        duplicatesSkipped: duplicates,
        failedRows: errors.length,
        errors: errors.slice(0, 20),
        warnings: warningSummary,
      },
    },
    `${inserted.length} project${inserted.length === 1 ? '' : 's'} imported successfully`,
    201
  );
};

const importStatistics = async (res, rows, villageId, log) => {
  if (rows.length !== 1) {
    return failureResponse(res, log, 'Statistics imports must contain exactly one data row.', [
      { row: 2, message: `found ${rows.length} data rows; expected 1` },
    ]);
  }

  const row = rows[0];
  const fields = {
    population: getValue(row, ['population', 'total population', 'residents']),
    waterCoverage: getValue(row, ['waterCoverage', 'water coverage', 'water']),
    electricityCoverage: getValue(row, ['electricityCoverage', 'electricity coverage', 'electricity']),
    roadConnectivity: getValue(row, ['roadConnectivity', 'road connectivity', 'roads']),
  };
  const sectors = {};
  SECTOR_FIELDS.forEach((sector) => {
    fields[sector] = getValue(row, [sector, `${sector} score`, `${sector} metric`]);
    sectors[sector] = fields[sector];
  });

  const errors = [];
  let population;
  try {
    population = parseNumber(fields.population, 'population', { min: 0, required: true });
  } catch (error) {
    errors.push({ row: 2, message: error.message });
  }

  const percentages = {};
  ['waterCoverage', 'electricityCoverage', 'roadConnectivity', ...SECTOR_FIELDS].forEach((field) => {
    try {
      percentages[field] = parseNumber(fields[field], field, { min: 0, max: 100, required: true });
    } catch (error) {
      errors.push({ row: 2, message: error.message });
    }
  });

  if (errors.length) {
    return failureResponse(
      res,
      log,
      'The statistics file contains missing or invalid fields.',
      errors
    );
  }

  let statistics = await VillageStatistics.findOne({ villageId });
  if (!statistics) statistics = new VillageStatistics({ villageId });

  statistics.population = population;
  statistics.waterCoverage = percentages.waterCoverage;
  statistics.electricityCoverage = percentages.electricityCoverage;
  statistics.roadConnectivity = percentages.roadConnectivity;
  statistics.sectorMetrics = {
    agriculture: percentages.agriculture,
    education: percentages.education,
    healthcare: percentages.healthcare,
    sanitation: percentages.sanitation,
    housing: percentages.housing,
  };
  await statistics.save();

  log.status = 'Success';
  log.recordsCount = 1;
  log.errorSummary = '';
  await log.save();

  return sendSuccess(
    res,
    {
      log,
      statistics,
      summary: { inserted: 1, duplicatesSkipped: 0, failedRows: 0, errors: [], warnings: '' },
    },
    'Village statistics imported successfully',
    201
  );
};






const importData = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please attach a CSV, XLS or XLSX file');
  const type = String(req.body.type || 'projects').toLowerCase();
  if (!['projects', 'statistics'].includes(type)) {
    throw new ApiError(400, "Import type must be either 'projects' or 'statistics'");
  }

  const villageId = req.user.villageId?._id || req.user.villageId;
  if (!villageId) throw new ApiError(403, 'No village is assigned to your account');

  const village = await Village.findById(villageId).select('_id');
  if (!village) throw new ApiError(404, 'Assigned village not found');

  const fileName = path.basename(req.file.originalname || 'upload').slice(0, 255);
  const log = await ImportLog.create({
    villageId,
    uploadedBy: req.user._id,
    fileName,
    recordsCount: 0,
    status: 'Processing',
    importType: type === 'projects' ? 'Projects' : 'Statistics',
  });

  try {
    const rows = parseWorkbook(req.file.buffer);
    if (!rows.length) {
      return await failureResponse(res, log, 'The uploaded file does not contain any data rows.', []);
    }
    if (rows.length > 5000) {
      return await failureResponse(res, log, 'The file exceeds the 5,000 row import limit.', []);
    }

    if (type === 'projects') return await importProjects(res, rows, villageId, log);
    return await importStatistics(res, rows, villageId, log);
  } catch (error) {
    log.status = 'Failed';
    log.recordsCount = 0;
    log.errorSummary = String(error.message || 'Import failed').slice(0, 2000);
    await log.save().catch(() => {});
    throw error;
  }
});




const listImportLogs = catchAsync(async (req, res) => {
  const villageId = req.user.villageId?._id || req.user.villageId;
  if (!villageId) throw new ApiError(403, 'No village is assigned to your account');

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
  const filter = { villageId };

  if (req.query.status && ['Success', 'Failed', 'Processing'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.type && ['Projects', 'Statistics'].includes(req.query.type)) {
    filter.importType = req.query.type;
  }

  const [logs, total, stats] = await Promise.all([
    ImportLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name email')
      .lean(),
    ImportLog.countDocuments(filter),
    ImportLog.aggregate([
      { $match: { villageId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          records: { $sum: '$recordsCount' },
        },
      },
    ]),
  ]);

  const summary = {
    total: 0,
    successful: 0,
    failed: 0,
    processing: 0,
    totalRecords: 0,
  };
  stats.forEach((group) => {
    summary.total += group.count;
    summary.totalRecords += group.records || 0;
    if (group._id === 'Success') summary.successful = group.count;
    if (group._id === 'Failed') summary.failed = group.count;
    if (group._id === 'Processing') summary.processing = group.count;
  });

  return sendSuccess(
    res,
    { logs, summary },
    'Import history fetched successfully',
    200,
    buildMeta({ page, limit, total })
  );
});




const downloadTemplate = (req, res) => {
  const type = String(req.query.type || 'projects').toLowerCase();
  let filename = 'projects-template.csv';
  let csv =
    'name,category,budget,progress,status,description\n' +
    '"Village Road Construction","Infrastructure",2500000,70,"Ongoing","Main village road widening and drainage"\n' +
    '"Primary School Renovation","Education",1250000,45,"Ongoing","Classroom repairs and library upgrade"\n' +
    '"Health Sub-Centre Building","Healthcare",1500000,15,"Planned","New primary health sub-centre"\n';

  if (type === 'statistics') {
    filename = 'village-statistics-template.csv';
    csv =
      'population,waterCoverage,electricityCoverage,roadConnectivity,agriculture,education,healthcare,sanitation,housing\n' +
      '2845,78,92,65,65,82,71,88,60\n';
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(`\uFEFF${csv}`);
};

module.exports = { importData, listImportLogs, downloadTemplate };
