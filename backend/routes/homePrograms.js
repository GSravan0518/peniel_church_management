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

    const program = await HomeProgram.create({
      name,
      place,
      eventType,
      date,
      time12h: normalizedTime,
      timeOfDay: periodFromTime12h(normalizedTime),
      phone: phone || '',
      notes: notes || '',
      createdBy: userId || undefined,
    });

    await Notification.create({
      title: 'New event booking request',
      message: `${name} booked ${eventTypeLabel(eventType)} at ${place} on ${new Date(
        date
      ).toLocaleDateString()} at ${normalizedTime}. Please approve.`,
      type: 'home_program_request',
      forRole: 'pastor',
      meta: { programId: program._id, eventType },
    });

    res.status(201).json({
      message: 'Booking submitted. Waiting for pastor approval.',
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
      await CalendarEvent.findOneAndUpdate(
        { program: program._id },
        {
          program: program._id,
          title: eventTypeLabel(program.eventType),
          hostName: program.name,
          place: program.place,
          eventType: program.eventType,
          date: program.date,
          time12h: program.time12h,
          notes: program.notes || '',
          phone: program.phone || '',
          approvedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await Notification.create({
        title: 'Program added to calendar',
        message: `${eventTypeLabel(program.eventType)} with ${program.name} at ${program.place} on ${new Date(
          program.date
        ).toLocaleDateString()} at ${program.time12h} was approved and saved to the calendar.`,
        type: 'calendar_reminder',
        forRole: 'pastor',
        meta: { programId: program._id, time12h: program.time12h },
      });

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
