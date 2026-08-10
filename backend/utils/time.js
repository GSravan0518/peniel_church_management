const CalendarEvent = require('../models/CalendarEvent');
const Notification = require('../models/Notification');
const HomeProgram = require('../models/HomeProgram');
const { eventTypeLabel } = require('./labels');

const CHURCH_TZ = () => process.env.CHURCH_TZ || 'Asia/Kolkata';

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

/** YYYY-MM-DD in a timezone (default: church / India). */
function toDateKey(value, timeZone = CHURCH_TZ()) {
  if (value == null || value === '') return null;

  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Parse booking date into a stable calendar day (noon UTC) + dateKey.
 * Avoids timezone day-shift for "YYYY-MM-DD" inputs.
 */
function calendarDateFromInput(value) {
  const dateKey = toDateKey(value, 'UTC') || toDateKey(value);
  if (!dateKey) return null;
  const [y, m, d] = dateKey.split('-').map(Number);
  return {
    dateKey,
    date: new Date(Date.UTC(y, m - 1, d, 12, 0, 0)),
  };
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

function eventDateKey(event) {
  if (event.dateKey) return event.dateKey;
  return toDateKey(event.date, 'UTC') || toDateKey(event.date);
}

/** Ensure every accepted home program has a calendar row with date + time. */
async function syncAcceptedProgramsToCalendar() {
  const accepted = await HomeProgram.find({ status: 'accepted' });
  let synced = 0;

  for (const program of accepted) {
    const parsed = calendarDateFromInput(program.dateKey || program.date);
    if (!parsed) continue;

    const time12h = normalizeTime12h(program.time12h) || program.time12h;
    await CalendarEvent.findOneAndUpdate(
      { program: program._id },
      {
        program: program._id,
        title: eventTypeLabel(program.eventType),
        hostName: program.name,
        place: program.place,
        eventType: program.eventType,
        date: parsed.date,
        dateKey: parsed.dateKey,
        time12h,
        notes: program.notes || '',
        phone: program.phone || '',
        approvedBy: program.reviewedBy || undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    synced += 1;
  }

  return synced;
}

/** Create day-of notifications for approved calendar programs happening today (church TZ). */
async function ensureTodayProgramNotifications(reference = new Date()) {
  await syncAcceptedProgramsToCalendar();

  const todayKey = toDateKey(reference, CHURCH_TZ());
  const all = await CalendarEvent.find().sort({ time12h: 1 });
  const todays = all.filter((event) => eventDateKey(event) === todayKey);

  const created = [];

  for (const event of todays) {
    const existing = await Notification.findOne({
      type: 'day_of_program',
      forRole: 'pastor',
      'meta.calendarEventId': String(event._id),
      'meta.dayKey': todayKey,
    });

    if (existing) continue;

    const notification = await Notification.create({
      title: `Today’s program · ${event.time12h}`,
      message: `${event.title} with ${event.hostName} at ${event.place} today at ${event.time12h}.`,
      type: 'day_of_program',
      forRole: 'pastor',
      meta: {
        calendarEventId: String(event._id),
        programId: event.program,
        dayKey: todayKey,
        time12h: event.time12h,
        dateKey: eventDateKey(event),
      },
    });
    created.push(notification);
  }

  return { todays, created, todayKey };
}

module.exports = {
  startOfDay,
  endOfDay,
  toDateKey,
  calendarDateFromInput,
  normalizeTime12h,
  periodFromTime12h,
  syncAcceptedProgramsToCalendar,
  ensureTodayProgramNotifications,
  CHURCH_TZ,
};
