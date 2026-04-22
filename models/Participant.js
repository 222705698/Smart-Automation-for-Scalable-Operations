const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  participantId: { type: String, required: true, unique: true },
  name:          { type: String, required: true },
  department:    { type: String, enum: ['Division A', 'Division B', 'Division C'], required: true },
});

module.exports = mongoose.model('Participant', participantSchema);