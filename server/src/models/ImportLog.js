const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema(
  {
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village reference is required'],
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name is too long'],
    },
    recordsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Success', 'Failed', 'Processing'],
      default: 'Processing',
      index: true,
    },
    importType: {
      type: String,
      enum: ['Projects', 'Statistics'],
      default: 'Projects',
    },
    errorSummary: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

importLogSchema.index({ villageId: 1, timestamp: -1 });

module.exports = mongoose.model('ImportLog', importLogSchema);
