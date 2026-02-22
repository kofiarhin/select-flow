const mongoose = require('mongoose');

const PROJECT_STATUSES = ['AWAITING_SELECTION', 'SELECTION_RECEIVED', 'EDITING', 'FINAL_DELIVERED'];

const projectSchema = new mongoose.Schema(
  {
    photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photographer', required: true, index: true },
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: PROJECT_STATUSES, default: 'AWAITING_SELECTION' },
    clientAccessToken: { type: String, required: true, unique: true, index: true }
  },
  { timestamps: true }
);

module.exports = { Project: mongoose.model('Project', projectSchema), PROJECT_STATUSES };
