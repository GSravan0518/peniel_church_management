/**
 * Create a real admin or pastor account (no demo passwords).
 *
 * Usage (PowerShell):
 *   $env:STAFF_ROLE="admin"
 *   $env:STAFF_NAME="Your Name"
 *   $env:STAFF_EMAIL="you@example.com"
 *   $env:STAFF_PHONE="9876543210"
 *   $env:STAFF_PASSWORD="your-secure-password"
 *   npm run create:staff
 *
 * Or one line (cmd):
 *   set STAFF_ROLE=pastor&& set STAFF_NAME=...&& set STAFF_EMAIL=...&& set STAFF_PHONE=...&& set STAFF_PASSWORD=...&& npm run create:staff
 */
const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');

const role = String(process.env.STAFF_ROLE || '').trim().toLowerCase();
const name = String(process.env.STAFF_NAME || '').trim();
const email = String(process.env.STAFF_EMAIL || '').trim().toLowerCase();
const phone = String(process.env.STAFF_PHONE || '').trim();
const password = String(process.env.STAFF_PASSWORD || '');

async function main() {
  if (!['admin', 'pastor'].includes(role)) {
    console.error('Set STAFF_ROLE to "admin" or "pastor".');
    process.exit(1);
  }
  if (!name || !email || !phone || !password) {
    console.error('Required: STAFF_NAME, STAFF_EMAIL, STAFF_PHONE, STAFF_PASSWORD');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('STAFF_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);

  const existing = await User.findOne({
    $or: [{ email }, { phoneDigits: phone.replace(/\D/g, '') }],
  });
  if (existing) {
    console.error('A user with that email or phone already exists.');
    process.exit(1);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  console.log(`Created ${role}: ${user.name} <${user.email}>`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
