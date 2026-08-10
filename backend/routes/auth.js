const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const config = require('../config/env');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpire });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar || '',
});

async function createAccount(req, res, { role, notifyTitle, successMessage }) {
  try {
    const { name, email, password, phone, birthday, anniversary } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: 'Name, email, phone, and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const phoneDigits = User.digitsOnly(phone);

    if (!phoneDigits || phoneDigits.length < 8) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const phoneTaken = await User.findOne({ phoneDigits });
    if (phoneTaken) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      phone: String(phone).trim(),
      birthday,
      anniversary,
      role,
    });

    await Notification.create({
      title: notifyTitle,
      message: `${user.name} registered (${user.email} · ${user.phone}).`,
      type: 'user_registered',
      forRole: 'admin',
      meta: { userId: user._id, role },
    });

    // Do not auto-login — user must sign in after registering
    res.status(201).json({
      message: successMessage,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email or phone already registered' });
    }
    res.status(500).json({ message: err.message });
  }
}

router.post('/register', async (req, res) =>
  createAccount(req, res, {
    role: 'member',
    notifyTitle: 'New believer registration',
    successMessage:
      'Account created successfully. Please log in with your email or phone.',
  })
);

router.post('/register-pastor', async (req, res) =>
  createAccount(req, res, {
    role: 'pastor',
    notifyTitle: 'New pastor registration',
    successMessage:
      'Pastor account created successfully. Please log in with your email or phone.',
  })
);

router.post('/login', async (req, res) => {
  try {
    const identifier = String(
      req.body.emailOrPhone || req.body.login || req.body.email || req.body.phone || ''
    ).trim();
    const password = String(req.body.password || '');
    const portal = req.body.portal;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email or phone, and password are required' });
    }

    // Look up account from MongoDB by email or phone
    const user = await User.findByEmailOrPhone(identifier);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Invalid email/phone or password. Check your details and try again.',
      });
    }

    // Separate portals: believer / pastor / admin
    if (portal === 'believer' && user.role !== 'member') {
      return res.status(403).json({
        message: 'This login is for believers only. Use Pastor or Admin Login.',
      });
    }

    if (portal === 'pastor' && user.role !== 'pastor') {
      return res.status(403).json({
        message: 'This login is for pastors only. Use Believer or Admin Login.',
      });
    }

    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        message: 'This login is for admins only. Use Believer or Pastor Login.',
      });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Confirm a user record exists in MongoDB (email or phone)
router.get('/lookup', async (req, res) => {
  try {
    const identifier = String(req.query.q || '').trim();
    if (!identifier) {
      return res.status(400).json({ message: 'Provide ?q=email-or-phone' });
    }
    const user = await User.findByEmailOrPhone(identifier).select('name email phone role createdAt');
    if (!user) return res.status(404).json({ stored: false, message: 'No account in database' });
    res.json({ stored: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

/** Logged-in user uploads their own profile picture */
router.post('/me/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please choose a profile picture file' });
    }

    if (req.user.avatar && req.user.avatar.startsWith('/uploads/')) {
      fs.unlink(path.join(__dirname, '..', req.user.avatar), () => {});
    }

    req.user.avatar = `/uploads/${req.file.filename}`;
    await req.user.save();

    res.json({
      message: 'Profile picture updated.',
      user: publicUser(req.user),
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: err.message });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'bio', 'birthday', 'anniversary'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) req.user[key] = req.body[key];
    });
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
