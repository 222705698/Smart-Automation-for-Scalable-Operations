const express    = require('express');
const router     = express.Router();
const Session    = require('../models/Session');
const Allocation = require('../models/Allocation');

const DEPT_LIMITS = { 'Division A': 8, 'Division B': 6, 'Division C': 6 };

router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find();
    const stats = await Promise.all(sessions.map(async (s) => {
      const enrolled = await Allocation.countDocuments({ sessionId: s.sessionId });
      const deptBreakdown = await Promise.all(
        Object.keys(DEPT_LIMITS).map(async (dept) => ({
          dept,
          count: await Allocation.countDocuments({ sessionId: s.sessionId, department: dept }),
          max: DEPT_LIMITS[dept],
        }))
      );
      return { ...s.toObject(), enrolled, available: s.capacity - enrolled, deptBreakdown };
    }));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;