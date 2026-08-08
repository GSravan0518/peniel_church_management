const express = require('express');
const CalendarEvent = require('../models/CalendarEvent');
const { protect, authorize } = require('../middleware/auth');
const { startOfDay, endOfDay, ensureTodayProgramNotifications } = require('../utils/time');

const router = express.Router();

// Month calendar for pastor
router.get('/', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    await ensureTodayProgramNotifications();

    const base = req.query.month ? new Date(`${req.query.month}-01T00:00:00`) : new Date();
    const year = base.getFullYear();
    const month = base.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const events = await CalendarEvent.find({
      date: { $gte: monthStart, $lte: monthEnd },
    }).sort({ date: 1, time12h: 1 });

    const todays = await CalendarEvent.find({
      date: { $gte: startOfDay(), $lte: endOfDay() },
    }).sort({ time12h: 1 });

    res.json({
      month: `${year}-${String(month + 1).padStart(2, '0')}`,
      events,
      todays,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/today', protect, authorize('pastor', 'admin'), async (_req, res) => {
  try {
    const { todays, created } = await ensureTodayProgramNotifications();
    res.json({ programs: todays, newNotifications: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
