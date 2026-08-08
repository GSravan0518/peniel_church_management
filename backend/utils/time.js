const CalendarEvent = require('../models/CalendarEvent');
const Notification = require('../models/Notification');

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function normalizeTime12h(value) {
  const raw = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const match = raw.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/);
  if (!match) return null;
  const hour = match[1].padStart(2, '0');
  return `${hour}:${match[2]} ${match[3]}`;
}

function periodFromTime12h(time12h) {
  return String(time12h).toUpperCase().includes('PM') ? 'PM' : 'AM';
}

/** Create day-of notifications for approved calendar programs happening today */
async function ensureTodayProgramNotifications(reference = new Date()) {
  const dayStart = startOfDay(reference);
  const dayEnd = endOfDay(reference);
  const todayKey = dayStart.toISOString().slice(0, 10);

  const todays = await CalendarEvent.find({
    date: { $gte: dayStart, $lte: dayEnd },
  }).sort({ time12h: 1 });

  const created = [];

  for (const event of todays) {
    const existing = await Notification.findOne({
      type: 'day_of_program',
      forRole: 'pastor',
      'meta.calendarEventId': event._id,
      'meta.dayKey': todayKey,
    });

    if (existing) continue;

    const notification = await Notification.create({
      title: `Today’s program · ${event.time12h}`,
      message: `${event.title} with ${event.hostName} at ${event.place} today at ${event.time12h}.`,
      type: 'day_of_program',
      forRole: 'pastor',
      meta: {
        calendarEventId: event._id,
        programId: event.program,
        dayKey: todayKey,
        time12h: event.time12h,
      },
    });
    created.push(notification);
  }

  return { todays, created };
}

module.exports = {
  startOfDay,
  endOfDay,
  normalizeTime12h,
  periodFromTime12h,
  ensureTodayProgramNotifications,
};
