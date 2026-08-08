const express = require('express');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin uploads picture file to server + MongoDB record
router.post(
  '/upload',
  protect,
  authorize('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please choose an image file' });
      }

      const title = String(req.body.title || '').trim() || req.file.originalname;
      const description = String(req.body.description || '').trim();
      const category = req.body.category || 'other';

      const item = await Gallery.create({
        title,
        description,
        category,
        imageUrl: `/uploads/${req.file.filename}`,
        uploadedBy: req.user._id,
      });

      res.status(201).json({
        message: 'Picture uploaded and stored in the database.',
        item,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Admin can also add by external URL
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const item = await Gallery.create({ ...req.body, uploadedBy: req.user._id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.imageUrl);
      fs.unlink(filePath, () => {});
    }

    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
