const express = require('express');
const HomeProgram = require('../models/HomeProgram');
const CalendarEvent = require('../models/CalendarEvent');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { getSundayWeekRange } = require('../utils/week');
const {
  normalizeTime12h,
  periodFromTime12h,
  ensureTodayProgramNotifications,
  calendarDateFromInput,
} = require('../utils/time');
const { eventTypeLabel } = require('../utils/labels');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    else if (req.query.public === 'true') {
      filter.status = 'accepted';
      filter.date = { $gte: new Date() };
    }

    const programs = await HomeProgram.find(filter).sort({ date: 1, time12h: 1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, place, eventType, date, time12h, phone, notes, userId } = req.body;

    if (!name || !place || !eventType || !date || !time12h) {
      return res.status(400).json({
        message: 'Name, place, event type, date, and time (12-hour) are required',
      });
    }

    if (!HomeProgram.EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    const normalizedTime = normalizeTime12h(time12h);
    if (!normalizedTime) {
      return res.status(400).json({
        message: 'Time must be in 12-hour format, e.g. 10:30 AM',
      });
    }

    const parsedDate = calendarDateFromInput(date);
    if (!parsedDate) {
      return res.status(400).json({ message: 'Enter a valid program date' });
    }

    const program = await HomeProgram.create({
      name,
      place,
      eventType,
      date: parsedDate.date,
      dateKey: parsedDate.dateKey,
      time12h: normalizedTime,
      timeOfDay: periodFromTime12h(normalizedTime),
      phone: phone || '',
      notes: notes || '',
      createdBy: userId || undefined,
    });

    const notifyMessage = `${name} booked ${eventTypeLabel(eventType)} at ${place} on ${parsedDate.dateKey} at ${normalizedTime}. Please approve.`;

    await Notification.create([
      {
        title: 'New event booking request',
        message: notifyMessage,
        type: 'home_program_request',
        forRole: 'pastor',
        meta: { programId: program._id, eventType, dateKey: parsedDate.dateKey, time12h: normalizedTime },
      },
      {
        title: 'New event booking request',
        message: notifyMessage,
        type: 'home_program_request',
        forRole: 'admin',
        meta: { programId: program._id, eventType, dateKey: parsedDate.dateKey, time12h: normalizedTime },
      },
    ]);

    res.status(201).json({
      message: 'Booking submitted. Waiting for pastor or admin approval.',
      program,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/manage', protect, authorize('pastor', 'admin'), async (_req, res) => {
  try {
    const programs = await HomeProgram.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/weekly-digest', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const { weekStart, weekEnd } = getSundayWeekRange(
      req.query.date ? new Date(req.query.date) : new Date()
    );

    const requests = await HomeProgram.find({
      createdAt: { $gte: weekStart, $lt: weekEnd },
    }).sort({ date: 1 });

    const summary = {
      weekStart,
      weekEnd,
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      requests,
    };

    let digest = await Notification.findOne({
      type: 'weekly_digest',
      weekStart,
      weekEnd,
      forRole: 'pastor',
    });

    const message = `Sunday–Sunday week summary: ${summary.total} request(s) — ${summary.pending} pending, ${summary.accepted} accepted, ${summary.rejected} rejected.`;

    if (!digest) {
      digest = await Notification.create({
        title: 'Weekly home program summary',
        message,
        type: 'weekly_digest',
        forRole: 'pastor',
        weekStart,
        weekEnd,
        meta: {
          total: summary.total,
          pending: summary.pending,
          accepted: summary.accepted,
          rejected: summary.rejected,
        },
      });
    } else {
      digest.message = message;
      digest.meta = {
        total: summary.total,
        pending: summary.pending,
        accepted: summary.accepted,
        rejected: summary.rejected,
      };
      await digest.save();
    }

    res.json({ summary, notification: digest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const program = await HomeProgram.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNote: reviewNote || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!program) return res.status(404).json({ message: 'Request not found' });

    if (status === 'accepted') {
      const parsedDate = calendarDateFromInput(program.dateKey || program.date);
      if (!parsedDate) {
        return res.status(400).json({ message: 'Program has an invalid date' });
      }

      const time12h = normalizeTime12h(program.time12h) || program.time12h;

      program.date = parsedDate.date;
      program.dateKey = parsedDate.dateKey;
      program.time12h = time12h;
      await program.save();

      const calendarEvent = await CalendarEvent.findOneAndUpdate(
        { program: program._id },
        {
          program: program._id,
          title: eventTypeLabel(program.eventType),
          hostName: program.name,
          place: program.place,
          eventType: program.eventType,
          date: parsedDate.date,
          dateKey: parsedDate.dateKey,
          time12h,
          notes: program.notes || '',
          phone: program.phone || '',
          approvedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await Notification.create({
        title: 'Program added to calendar',
        message: `${eventTypeLabel(program.eventType)} with ${program.name} at ${program.place} on ${parsedDate.dateKey} at ${time12h} was approved and saved to the calendar.`,
        type: 'calendar_reminder',
        forRole: 'pastor',
        meta: {
          programId: program._id,
          calendarEventId: calendarEvent._id,
          time12h,
          dateKey: parsedDate.dateKey,
        },
      });

      // If the program is today, create the pastor day-of notification immediately
      await ensureTodayProgramNotifications();
    } else {
      await CalendarEvent.deleteOne({ program: program._id });
      await Notification.create({
        title: status === 'rejected' ? 'Program rejected' : 'Program updated',
        message: `${program.name}'s request at ${program.place} was marked ${status}.`,
        type: 'home_program_request',
        forRole: 'pastor',
        meta: { programId: program._id, status },
      });
    }

    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
