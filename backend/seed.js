/**
 * Clears sample / legacy seed data. Does NOT create any users or passwords.
 * Believers register on the website. Create admin/pastor with:
 *   npm run create:staff --prefix backend
 */
const mongoose = require('mongoose');
const config = require('./config/env');
const User = require('./models/User');
const Event = require('./models/Event');
const HomeProgram = require('./models/HomeProgram');
const CalendarEvent = require('./models/CalendarEvent');
const Notification = require('./models/Notification');
const Devotion = require('./models/Devotion');
const Prayer = require('./models/Prayer');
const Occasion = require('./models/Occasion');
const Gallery = require('./models/Gallery');

const seed = async () => {
  await mongoose.connect(config.mongoUri);
  console.log(`Connected to ${config.mongoUri}`);
  console.log(`Resetting database for ${config.churchName}...`);

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    HomeProgram.deleteMany({}),
    CalendarEvent.deleteMany({}),
    Notification.deleteMany({}),
    Devotion.deleteMany({}),
    Prayer.deleteMany({}),
    Occasion.deleteMany({}),
    Gallery.deleteMany({}),
  ]);

  console.log('Database cleared. No demo accounts were created.');
  console.log('Believers: register at /register');
  console.log('Admin / pastor: npm run create:staff --prefix backend');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
