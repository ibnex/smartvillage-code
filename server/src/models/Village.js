const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Village name is required'],
      trim: true,
      maxlength: [120, 'Village name cannot exceed 120 characters'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      maxlength: [100, 'District cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    villageCode: {
      type: String,
      required: [true, 'Village code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [40, 'Village code cannot exceed 40 characters'],
    },
    location: {
      lat: { type: Number, min: -90, max: 90, default: null },
      lng: { type: Number, min: -180, max: 180, default: null },
    },
    households: {
      type: Number,
      min: [0, 'Households cannot be negative'],
      default: 0,
    },
    areaSqKm: {
      type: Number,
      min: [0, 'Area cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

villageSchema.index({ district: 1, state: 1 });

module.exports = mongoose.model('Village', villageSchema);
