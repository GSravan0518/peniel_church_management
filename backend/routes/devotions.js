const express = require('express');
const Devotion = require('../models/Devotion');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const devotionals = await Devotion.find().sort({ date: -1 });
    res.json(devotionals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const devotion = await Devotion.findById(req.params.id);
    if (!devotion) return res.status(404).json({ message: 'Devotional not found' });
    res.json(devotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const devotion = await Devotion.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(devotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const devotion = await Devotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!devotion) return res.status(404).json({ message: 'Devotional not found' });
    res.json(devotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    const devotion = await Devotion.findByIdAndDelete(req.params.id);
    if (!devotion) return res.status(404).json({ message: 'Devotional not found' });
    res.json({ message: 'Devotional deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
