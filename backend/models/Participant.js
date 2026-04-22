const mongoose = require("../db");

const participantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  assignedSession: { type: String, default: null }
});

module.exports = mongoose.model("Participant", participantSchema);
