const mongoose = require('mongoose');

const COMPLAINT_CATEGORIES = ['Water Supply', 'Electricity', 'Roads', 'Sanitation', 'Other'];
const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved'];

const complaintSchema = new mongoose.Schema(
  {
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village reference is required'],
      index: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen reference is required'],
      index: true,
    },
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [160, 'Complaint title cannot exceed 160 characters'],
    },
    category: {
      type: String,
      enum: {
        values: COMPLAINT_CATEGORIES,
        message: '{VALUE} is not a supported complaint category',
      },
      required: [true, 'Complaint category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: COMPLAINT_STATUSES,
        message: '{VALUE} is not a supported complaint status',
      },
      default: 'Pending',
      index: true,
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution note cannot exceed 1000 characters'],
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

complaintSchema.index({ villageId: 1, status: 1 });
complaintSchema.index({ citizenId: 1, createdAt: -1 });

complaintSchema.statics.CATEGORIES = COMPLAINT_CATEGORIES;
complaintSchema.statics.STATUSES = COMPLAINT_STATUSES;

module.exports = mongoose.model('Complaint', complaintSchema);
