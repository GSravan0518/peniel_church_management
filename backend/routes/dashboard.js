const express = require('express');
const User = require('../models/User');
const Prayer = require('../models/Prayer');
const Contact = require('../models/Contact');
const Devotion = require('../models/Devotion');
const Occasion = require('../models/Occasion');
const HomeProgram = require('../models/HomeProgram');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { getSundayWeekRange } = require('../utils/week');

const router = express.Router();

router.get('/member', protect, async (req, res) => {
  try {
    const myRequests = await HomeProgram.find({
      $or: [{ createdBy: req.user._id }, { name: req.user.name }],
    }).sort({ date: 1 });

    const acceptedPrograms = await HomeProgram.find({
      status: 'accepted',
      date: { $gte: new Date() },
    })
      .sort({ date: 1 })
      .limit(5);

    const latestDevotion = await Devotion.findOne().sort({ date: -1 });

    res.json({
      user: req.user,
      myRequests,
      acceptedPrograms,
      latestDevotion,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/pastor', protect, authorize('pastor', 'admin'), async (_req, res) => {
  try {
    const { weekStart, weekEnd } = getSundayWeekRange();

    const [
      members,
      pendingPrograms,
      weekPrograms,
      prayers,
      messages,
      devotionals,
      occasions,
      notifications,
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      HomeProgram.find({ status: 'pending' }).sort({ date: 1 }),
      HomeProgram.find({ createdAt: { $gte: weekStart, $lt: weekEnd } }).sort({ date: 1 }),
      Prayer.find().sort({ createdAt: -1 }).limit(10),
      Contact.find({ isRead: false }).sort({ createdAt: -1 }),
      Devotion.countDocuments(),
      Occasion.find().sort({ date: 1 }).limit(10),
      Notification.find({ forRole: 'pastor' }).sort({ createdAt: -1 }).limit(20),
    ]);

    res.json({
      stats: {
        members,
        pendingHomePrograms: pendingPrograms.length,
        weekRequests: weekPrograms.length,
        prayers: await Prayer.countDocuments(),
        unreadMessages: messages.length,
        devotionals,
        unreadNotifications: notifications.filter((n) => !n.isRead).length,
      },
      pendingPrograms,
      weekPrograms,
      weekStart,
      weekEnd,
      prayers,
      messages,
      occasions,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/members', protect, authorize('pastor', 'admin'), async (_req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password').sort({ name: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
