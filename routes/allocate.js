const express    = require('express');
const router     = express.Router();
const Allocation = require('../models/Allocation');

const DEPT_LIMITS = {
  'Division A': 8,
  'Division B': 6,
  'Division C': 6,
};

router.post('/', async (req, res) => {
  try {
    const { participantId, sessionId, department } = req.body;

    if (!participantId || !sessionId || !department)
      return res.status(400).json({ error: 'Missing required fields.' });

    const existing = await Allocation.findOne({ participantId });
    if (existing)
      return res.status(400).json({ error: 'Participant is already assigned.' });

    const sessionCount = await Allocation.countDocuments({ sessionId });
    if (sessionCount >= 20)
      return res.status(400).json({ error: 'Session is full (20/20).' });

    const deptCount = await Allocation.countDocuments({ sessionId, department });
    if (deptCount >= DEPT_LIMITS[department])
      return res.status(400).json({ error: `${department} limit reached.` });

    const allocation = await Allocation.create({ participantId, sessionId, department });
    res.status(201).json({ success: true, allocation, seatsLeft: 20 - (sessionCount + 1) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:participantId', async (req, res) => {
  try {
    await Allocation.findOneAndDelete({ participantId: req.params.participantId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;