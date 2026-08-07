const express = require('express');
const Occasion = require('../models/Occasion');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = { isPublic: true };
    if (req.query.type) filter.type = req.query.type;
    const occasions = await Occasion.find(filter).sort({ date: 1 });
    res.json(occasions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const occasion = await Occasion.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(occasion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('pastor', 'admin'), async (req, res) => {
  try {
    await Occasion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Occasion deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
