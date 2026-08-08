const path = require('path');
const fs = require('fs');
const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

function removeOldAvatar(avatarPath) {
  if (!avatarPath || !avatarPath.startsWith('/uploads/')) return;
  const filePath = path.join(__dirname, '..', avatarPath);
  fs.unlink(filePath, () => {});
}

/** Admin uploads a profile picture for any user */
router.post(
  '/:id/avatar',
  protect,
  authorize('admin'),
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please choose a profile picture file' });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: 'User not found' });
      }

      removeOldAvatar(user.avatar);
      user.avatar = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({
        message: `Profile picture updated for ${user.name}.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(500).json({ message: err.message });
    }
  }
);

/** Admin removes a user's profile picture */
router.delete('/:id/avatar', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    removeOldAvatar(user.avatar);
    user.avatar = '';
    await user.save();

    res.json({
      message: 'Profile picture removed.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
