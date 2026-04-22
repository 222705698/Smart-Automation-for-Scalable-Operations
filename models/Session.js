const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  label:     { type: String, required: true },
  timeSlot:  { type: String, required: true },
  capacity:  { type: Number, default: 20 },
});

module.exports = mongoose.model('Session', sessionSchema);