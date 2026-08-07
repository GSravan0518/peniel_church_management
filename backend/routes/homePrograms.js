const express = require('express');
const HomeProgram = require('../models/HomeProgram');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { getSundayWeekRange } = require('../utils/week');

const router = express.Router();

// Public: accepted home programs (upcoming)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    else if (req.query.public === 'true') {
      filter.status = 'accepted';
      filter.date = { $gte: new Date() };
    }

    const programs = await HomeProgram.find(filter).sort({ date: 1, timeOfDay: 1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Believer submits a home program request
router.post('/', async (req, res) => {
  try {
    const { name, place, eventType, date, timeOfDay, phone, notes, userId } = req.body;

    if (!name || !place || !eventType || !date || !timeOfDay) {
      return res.status(400).json({
        message: 'Name, place, event type, date, and time (AM/PM) are required',
      });
    }

    if (!HomeProgram.EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    const period = String(timeOfDay).toUpperCase();
    if (!['AM', 'PM'].includes(period)) {
      return res.status(400).json({ message: 'Time must be AM or PM' });
    }

    const program = await HomeProgram.create({
      name,
      place,
      eventType,
      date,
      timeOfDay: period,
      phone: phone || '',
      notes: notes || '',
      createdBy: userId || undefined,
    });

    await Notification.create({
      title: 'New home program request',
      message: `${name} requested a ${eventType.replace(/_/g, ' ')} at ${place} on ${new Date(date).toLocaleDateString()} (${period}). Please accept or reject the slot.`,
      type: 'home_program_request',
      forRole: 'pastor',
      meta: { programId: program._id, eventType },
    });

    res.status(201).json({
      message: 'Request submitted. The pastor will review and accept the slot.',
      program,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pastor: pending + all requests
router.get('/manage', protect, authorize('pastor', 'admin'), async (_req, res) => {
  try {
    const programs = await HomeProgram.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Weekly digest Sunday → Sunday for pastor (before /:id routes)
router.get('/weekly-digest', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const { weekStart, weekEnd } = getSundayWeekRange(req.query.date ? new Date(req.query.date) : new Date());

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

    // Ensure a weekly notification exists for this Sunday–Sunday window
    let digest = await Notification.findOne({
      type: 'weekly_digest',
      weekStart,
      weekEnd,
      forRole: 'pastor',
    });

    if (!digest) {
      digest = await Notification.create({
        title: 'Weekly home program summary',
        message: `Sunday–Sunday week summary: ${summary.total} request(s) — ${summary.pending} pending, ${summary.accepted} accepted, ${summary.rejected} rejected.`,
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
      digest.message = `Sunday–Sunday week summary: ${summary.total} request(s) — ${summary.pending} pending, ${summary.accepted} accepted, ${summary.rejected} rejected.`;
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

// Pastor accepts or rejects a slot
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

    await Notification.create({
      title: status === 'accepted' ? 'Home program accepted' : 'Home program updated',
      message: `${program.name}'s request at ${program.place} was marked ${status}.`,
      type: 'home_program_request',
      forRole: 'pastor',
      meta: { programId: program._id, status },
    });

    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
