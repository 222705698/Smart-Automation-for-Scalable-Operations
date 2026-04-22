const mongoose = require("../db");

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  time: { type: String, required: true },
  capacity: { type: Number, required: true },
  allocations: [{ type: String }], // participant IDs
  departmentSeats: { type: Map, of: Number } // { Division A: 8, Division B: 6, Division C: 6 }
});

module.exports = mongoose.model("Session", sessionSchema);
