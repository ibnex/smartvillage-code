const mongoose = require('mongoose');

const PROJECT_CATEGORIES = [
  'Infrastructure',
  'Education',
  'Water Supply',
  'Energy',
  'Healthcare',
  'Sanitation',
];

const PROJECT_STATUSES = ['Planned', 'Ongoing', 'Completed', 'On Hold'];

const projectSchema = new mongoose.Schema(
  {
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [160, 'Project name cannot exceed 160 characters'],
    },
    category: {
      type: String,
      enum: {
        values: PROJECT_CATEGORIES,
        message: '{VALUE} is not a supported project category',
      },
      required: [true, 'Project category is required'],
    },
    budget: {
      type: Number,
      required: [true, 'Project budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    progress: {
      type: Number,
      required: [true, 'Project progress is required'],
      min: [0, 'Progress cannot be below 0'],
      max: [100, 'Progress cannot exceed 100'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: PROJECT_STATUSES,
        message: '{VALUE} is not a supported project status',
      },
      default: 'Planned',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

projectSchema.index({ villageId: 1, status: 1 });
projectSchema.index({ villageId: 1, name: 1 });

projectSchema.statics.CATEGORIES = PROJECT_CATEGORIES;
projectSchema.statics.STATUSES = PROJECT_STATUSES;

module.exports = mongoose.model('Project', projectSchema);
