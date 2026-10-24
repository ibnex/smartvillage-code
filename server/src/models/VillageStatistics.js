const mongoose = require('mongoose');

const percentage = {
  type: Number,
  min: [0, 'Percentage cannot be below 0'],
  max: [100, 'Percentage cannot exceed 100'],
  default: 0,
};

const villageStatisticsSchema = new mongoose.Schema(
  {
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village reference is required'],
      unique: true,
      index: true,
    },
    population: {
      type: Number,
      min: [0, 'Population cannot be negative'],
      default: 0,
    },
    waterCoverage: percentage,
    electricityCoverage: percentage,
    roadConnectivity: percentage,
    sectorMetrics: {
      agriculture: percentage,
      education: percentage,
      healthcare: percentage,
      sanitation: percentage,
      housing: percentage,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VillageStatistics', villageStatisticsSchema);
