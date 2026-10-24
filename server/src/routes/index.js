const express = require('express');
const authRoutes = require('./authRoutes');
const villageRoutes = require('./villageRoutes');
const projectRoutes = require('./projectRoutes');
const complaintRoutes = require('./complaintRoutes');
const statisticsRoutes = require('./statisticsRoutes');
const importRoutes = require('./importRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/villages', villageRoutes);
router.use('/projects', projectRoutes);
router.use('/complaints', complaintRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/import', importRoutes);
router.use('/users', userRoutes);

module.exports = router;
