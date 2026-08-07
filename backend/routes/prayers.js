const express = require('express');
const Prayer = require('../models/Prayer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const prayers = await Prayer.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(prayers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, request, isAnonymous, userId } = req.body;
    if (!request) return res.status(400).json({ message: 'Prayer request is required' });

    const prayer = await Prayer.create({
      name: isAnonymous ? 'Anonymous' : name || 'Anonymous',
      request,
      isAnonymous: Boolean(isAnonymous),
      createdBy: userId || undefined,
    });

    res.status(201).json(prayer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/pray', async (req, res) => {
  try {
    const prayer = await Prayer.findByIdAndUpdate(
      req.params.id,
      { $inc: { prayerCount: 1 } },
      { new: true }
    );
    if (!prayer) return res.status(404).json({ message: 'Prayer not found' });
    res.json(prayer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/answered', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const prayer = await Prayer.findByIdAndUpdate(
      req.params.id,
      { isAnswered: true },
      { new: true }
    );
    if (!prayer) return res.status(404).json({ message: 'Prayer not found' });
    res.json(prayer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    await Prayer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prayer removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
