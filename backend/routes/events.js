const express = require('express');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.upcoming === 'true') filter.date = { $gte: new Date() };

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { name, email, phone, guests, notes, userId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (event.registrations.length + (guests || 1) > event.capacity) {
      return res.status(400).json({ message: 'No appointment slots left for this event' });
    }

    const already = event.registrations.find(
      (r) => r.email.toLowerCase() === email.toLowerCase()
    );
    if (already) {
      return res.status(400).json({ message: 'You already have an appointment for this event' });
    }

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required to book an appointment' });
    }

    event.registrations.push({
      user: userId || undefined,
      name,
      email,
      phone,
      guests: guests || 1,
      notes: notes || '',
    });

    await event.save();
    res.status(201).json({ message: 'Appointment booked successfully', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
