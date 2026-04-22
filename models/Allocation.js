const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  participantId: { type: String, required: true, unique: true },
  sessionId:     { type: String, required: true },
  department:    { type: String, required: true },
  allocatedAt:   { type: Date, default: Date.now },
});

allocationSchema.index({ sessionId: 1 });
allocationSchema.index({ sessionId: 1, department: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);