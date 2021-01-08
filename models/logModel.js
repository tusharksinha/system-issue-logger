const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({
  issue: {
    type: String,
    required: true,
  },
  system: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['High', 'Low', 'Medium'],
    default: 'Low',
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: Date,
  resolutionNote: String,
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
