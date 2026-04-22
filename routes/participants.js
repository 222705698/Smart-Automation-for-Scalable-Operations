const express     = require('express');
const router      = express.Router();
const Participant = require('../models/Participant');
const Allocation  = require('../models/Allocation');

router.get('/', async (req, res) => {
  try {
    const participants = await Participant.find();
    const allocations  = await Allocation.find();
    const assignedIds  = new Set(allocations.map(a => a.participantId));
    const result = participants.map(p => ({
      ...p.toObject(),
      isAssigned: assignedIds.has(p.participantId),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;