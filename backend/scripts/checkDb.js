/**
 * Quick check that auth users and ministry data are stored in MongoDB.
 * Run: npm run db:check --prefix backend
 */
const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const HomeProgram = require('../models/HomeProgram');
const Prayer = require('../models/Prayer');
const CalendarEvent = require('../models/CalendarEvent');
const Notification = require('../models/Notification');

async function main() {
  await mongoose.connect(config.mongoUri);
  const [users, programs, prayers, calendar, notifications] = await Promise.all([
    User.find().select('name email phone phoneDigits role').lean(),
    HomeProgram.countDocuments(),
    Prayer.countDocuments(),
    CalendarEvent.countDocuments(),
    Notification.countDocuments(),
  ]);

  console.log('Database:', config.mongoUri);
  console.log('Users stored:', users.length);
  users.forEach((u) => {
    console.log(` - ${u.role}: ${u.email} | phone ${u.phone} (digits ${u.phoneDigits})`);
  });
  console.log('Home programs:', programs);
  console.log('Prayers:', prayers);
  console.log('Calendar events:', calendar);
  console.log('Notifications:', notifications);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
