const express = require('express');
const User = require('../models/User');
const Prayer = require('../models/Prayer');
const Contact = require('../models/Contact');
const HomeProgram = require('../models/HomeProgram');
const Notification = require('../models/Notification');
const CalendarEvent = require('../models/CalendarEvent');
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const { getSundayWeekRange } = require('../utils/week');
const {
  startOfDay,
  endOfDay,
  ensureTodayProgramNotifications,
} = require('../utils/time');

const router = express.Router();

router.get('/member', protect, async (req, res) => {
  try {
    const myRequests = await HomeProgram.find({
      $or: [{ createdBy: req.user._id }, { name: req.user.name }],
    }).sort({ date: 1 });

    const myPrayers = await Prayer.find({
      $or: [{ createdBy: req.user._id }, { name: req.user.name }],
    }).sort({ createdAt: -1 });

    const acceptedPrograms = await HomeProgram.find({
      status: 'accepted',
      date: { $gte: new Date() },
    })
      .sort({ date: 1 })
      .limit(5);

    res.json({
      user: req.user,
      myRequests,
      myPrayers,
      acceptedPrograms,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin', protect, authorize('admin'), async (_req, res) => {
  try {
    const [
      users,
      programs,
      prayers,
      messages,
      gallery,
      calendar,
      notifications,
      believers,
      pastors,
      admins,
    ] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      HomeProgram.find().sort({ createdAt: -1 }).limit(50),
      Prayer.find().sort({ createdAt: -1 }).limit(50),
      Contact.find().sort({ createdAt: -1 }).limit(50),
      Gallery.find().sort({ createdAt: -1 }),
      CalendarEvent.find().sort({ date: -1 }).limit(50),
      Notification.find().sort({ createdAt: -1 }).limit(50),
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'pastor' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    res.json({
      stats: {
        users: users.length,
        believers,
        pastors,
        admins,
        programs: await HomeProgram.countDocuments(),
        pendingPrograms: await HomeProgram.countDocuments({ status: 'pending' }),
        prayers: await Prayer.countDocuments(),
        pendingPrayers: await Prayer.countDocuments({ status: 'pending' }),
        messages: messages.length,
        unreadMessages: messages.filter((m) => !m.isRead).length,
        gallery: gallery.length,
        calendar: calendar.length,
        notifications: notifications.length,
      },
      users,
      programs,
      prayers,
      messages,
      gallery,
      calendar,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/pastor', protect, authorize('pastor', 'admin'), async (_req, res) => {
  try {
    const { weekStart, weekEnd } = getSundayWeekRange();
    const { todays, created } = await ensureTodayProgramNotifications();

    const [
      members,
      pendingPrograms,
      pendingPrayers,
      weekPrograms,
      approvedPrayers,
      messages,
      notifications,
      upcomingCalendar,
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      HomeProgram.find({ status: 'pending' }).sort({ date: 1 }),
      Prayer.find({ status: 'pending' }).sort({ createdAt: -1 }),
      HomeProgram.find({ createdAt: { $gte: weekStart, $lt: weekEnd } }).sort({ date: 1 }),
      Prayer.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(10),
      Contact.find({ isRead: false }).sort({ createdAt: -1 }),
      Notification.find({ forRole: 'pastor' }).sort({ createdAt: -1 }).limit(30),
      CalendarEvent.find({ date: { $gte: startOfDay() } })
        .sort({ date: 1, time12h: 1 })
        .limit(20),
    ]);

    res.json({
      stats: {
        members,
        pendingHomePrograms: pendingPrograms.length,
        pendingPrayers: pendingPrayers.length,
        weekRequests: weekPrograms.length,
        todayPrograms: todays.length,
        unreadMessages: messages.length,
        unreadNotifications: notifications.filter((n) => !n.isRead).length,
        newDayNotifications: created.length,
      },
      pendingPrograms,
      pendingPrayers,
      weekPrograms,
      prayers: approvedPrayers,
      messages,
      notifications,
      upcomingCalendar,
      todaysPrograms: todays,
      weekStart,
      weekEnd,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
