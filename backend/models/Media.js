import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    originalName: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    deviceInfo: {
      source: { type: String, default: '' },
      cameraLabel: { type: String, default: '' },
      make: { type: String, default: '' },
      model: { type: String, default: '' },
      originalDateTime: { type: String, default: '' },
      platform: { type: String, default: '' },
      userAgent: { type: String, default: '' },
      language: { type: String, default: '' },
      timezone: { type: String, default: '' },
      screen: { type: String, default: '' },
      viewport: { type: String, default: '' },
      capturedAt: { type: Date },
      width: { type: Number },
      height: { type: Number },
      hasExif: { type: Boolean, default: false },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('Media', mediaSchema)
