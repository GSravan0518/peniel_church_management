const express = require('express');
const CalendarEvent = require('../models/CalendarEvent');
const { protect, authorize } = require('../middleware/auth');
const {
  ensureTodayProgramNotifications,
  toDateKey,
} = require('../utils/time');

const router = express.Router();

function eventMatchesMonth(event, year, month) {
  const key = event.dateKey || toDateKey(event.date, 'UTC') || toDateKey(event.date);
  if (!key) return false;
  const [y, m] = key.split('-').map(Number);
  return y === year && m === month + 1;
}

// Month calendar for pastor / admin
router.get('/', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const { todays } = await ensureTodayProgramNotifications();

    const base = req.query.month
      ? new Date(`${req.query.month}-01T12:00:00.000Z`)
      : new Date();
    const year = base.getUTCFullYear();
    const month = base.getUTCMonth();

    const all = await CalendarEvent.find().sort({ date: 1, time12h: 1 });
    const events = all.filter((event) => eventMatchesMonth(event, year, month));

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
    const { todays, created, todayKey } = await ensureTodayProgramNotifications();
    res.json({
      programs: todays,
      newNotifications: created.length,
      todayKey,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
