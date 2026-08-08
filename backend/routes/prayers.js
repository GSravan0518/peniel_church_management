const express = require('express');
const Prayer = require('../models/Prayer');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const prayers = await Prayer.find({ isApproved: true, status: 'approved' }).sort({
      createdAt: -1,
    });
    res.json(prayers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/pending', protect, authorize('pastor', 'admin'), async (_req, res) => {
  try {
    const prayers = await Prayer.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(prayers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, request, userId } = req.body;
    const trimmedName = String(name || '').trim();
    const trimmedRequest = String(request || '').trim();

    if (!trimmedName) {
      return res.status(400).json({ message: 'Name is required for a prayer request' });
    }
    if (!trimmedRequest) {
      return res.status(400).json({ message: 'Prayer request is required' });
    }

    const prayer = await Prayer.create({
      name: trimmedName,
      request: trimmedRequest,
      isAnonymous: false,
      isApproved: false,
      status: 'pending',
      createdBy: userId || undefined,
    });

    await Notification.create({
      title: 'New prayer request',
      message: `${prayer.name} shared a prayer request awaiting your approval.`,
      type: 'prayer_request',
      forRole: 'pastor',
      meta: { prayerId: prayer._id },
    });

    res.status(201).json({
      message: 'Prayer request submitted. It will appear after pastor approval.',
      prayer,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/pray', async (req, res) => {
  try {
    const prayer = await Prayer.findOneAndUpdate(
      { _id: req.params.id, isApproved: true },
      { $inc: { prayerCount: 1 } },
      { new: true }
    );
    if (!prayer) return res.status(404).json({ message: 'Prayer not found' });
    res.json(prayer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const prayer = await Prayer.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isApproved: status === 'approved',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
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
