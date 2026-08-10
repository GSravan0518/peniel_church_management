/**
 * One-time local helper: ensure a single admin account.
 * Do not commit real passwords. Run: node scripts/setSoleAdmin.js
 */
const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');

const email = String(process.env.ADMIN_EMAIL || 'sravankumargummalla@gmail.com')
  .trim()
  .toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || '');
const phone = String(process.env.ADMIN_PHONE || '7702096239').trim();
const name = String(process.env.ADMIN_NAME || 'Sravan Kumar Gummalla').trim();

async function main() {
  if (!password || password.length < 6) {
    console.error('Set ADMIN_PASSWORD (min 6 chars).');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);

  let admin = await User.findOne({ email });
  if (admin) {
    admin.name = name;
    admin.role = 'admin';
    admin.phone = phone;
    admin.password = password;
    await admin.save();
    console.log('Updated admin:', email);
  } else {
    const phoneDigits = User.digitsOnly(phone);
    const phoneOwner = await User.findOne({ phoneDigits, email: { $ne: email } });
    if (phoneOwner) {
      console.error('Phone already used by another account:', phoneOwner.email);
      process.exit(1);
    }
    await User.create({ name, email, phone, password, role: 'admin' });
    console.log('Created admin:', email);
  }

  const removed = await User.deleteMany({ role: 'admin', email: { $ne: email } });
  console.log('Removed other admins:', removed.deletedCount);

  const admins = await User.find({ role: 'admin' }).select('name email phone role');
  console.log(
    'Current admins:',
    admins.map((a) => ({ name: a.name, email: a.email, role: a.role }))
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
