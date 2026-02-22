const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    originalFilename: { type: String, required: true },
    storagePath: { type: String, required: true },
    previewPath: { type: String },
    fileType: { type: String, required: true },
    phase: { type: String, enum: ['ORIGINAL', 'FINAL'], required: true },
    isSelected: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
