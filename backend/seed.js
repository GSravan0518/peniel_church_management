require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const HomeProgram = require('./models/HomeProgram');
const Notification = require('./models/Notification');
const Devotion = require('./models/Devotion');
const Prayer = require('./models/Prayer');
const Occasion = require('./models/Occasion');
const Gallery = require('./models/Gallery');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Seeding...');

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    HomeProgram.deleteMany({}),
    Notification.deleteMany({}),
    Devotion.deleteMany({}),
    Prayer.deleteMany({}),
    Occasion.deleteMany({}),
    Gallery.deleteMany({}),
  ]);

  const pastor = await User.create({
    name: 'Pastor James Mitchell',
    email: 'pastor@penieleevangelicalfellowship.org',
    password: 'pastor123',
    role: 'pastor',
    phone: '(555) 010-2000',
    bio: 'Lead pastor of Peniel Evangelical Fellowship.',
  });

  const member = await User.create({
    name: 'Sarah Thompson',
    email: 'member@penieleevangelicalfellowship.org',
    password: 'member123',
    role: 'member',
    phone: '(555) 010-3000',
    birthday: new Date('1992-04-15'),
    anniversary: new Date('2018-06-20'),
  });

  await User.create({
    name: 'Admin User',
    email: 'admin@penieleevangelicalfellowship.org',
    password: 'admin123',
    role: 'admin',
  });

  const now = new Date();
  const inDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  await HomeProgram.insertMany([
    {
      name: 'Ravi Kumar',
      place: 'Near HP Gas Station Road, Gannavaram',
      eventType: 'family_prayer',
      date: inDays(3),
      timeOfDay: 'PM',
      status: 'pending',
      phone: '9876543210',
      notes: 'Requesting a home prayer meeting for family.',
      createdBy: member._id,
    },
    {
      name: 'Lakshmi Devi',
      place: 'Srinagar Colony, Gannavaram',
      eventType: 'birthday_prayer',
      date: inDays(5),
      timeOfDay: 'AM',
      status: 'accepted',
      phone: '9876501234',
      reviewedBy: pastor._id,
      reviewedAt: new Date(),
      createdBy: member._id,
    },
    {
      name: 'Samuel Joseph',
      place: 'Atkur',
      eventType: 'thanksgiving_prayer',
      date: inDays(6),
      timeOfDay: 'PM',
      status: 'pending',
      notes: 'Thanksgiving gathering in our home.',
    },
  ]);

  await Notification.create({
    title: 'New home program request',
    message:
      'Ravi Kumar requested a home program near HP Gas Station Road, Gannavaram. Please accept or reject the slot.',
    type: 'home_program_request',
    forRole: 'pastor',
  });

  await Devotion.insertMany([
    {
      title: 'Walking in the Light',
      scripture: '1 John 1:7',
      content:
        'When we walk in the light as He is in the light, we have fellowship with one another. Today, choose honesty over hiding, grace over guilt, and presence over performance. Let His light reorder your steps.',
      author: 'Pastor James Mitchell',
      date: inDays(-1),
      createdBy: pastor._id,
    },
    {
      title: 'Strength for the Weary',
      scripture: 'Isaiah 40:31',
      content:
        'Those who wait upon the Lord renew their strength. Waiting is not wasted time—it is active trust. Bring your fatigue to God and rise again with wings like eagles.',
      author: 'Pastor James Mitchell',
      date: inDays(-3),
      createdBy: pastor._id,
    },
    {
      title: 'A Heart of Thanksgiving',
      scripture: 'Psalm 100:4',
      content:
        'Enter His gates with thanksgiving. Gratitude turns ordinary mornings into altars. Name three mercies today and let praise reshape your outlook.',
      author: 'Pastor James Mitchell',
      date: inDays(-5),
      createdBy: pastor._id,
    },
  ]);

  await Prayer.insertMany([
    {
      name: 'Anonymous',
      request: 'Please pray for healing and peace for my mother as she undergoes treatment.',
      isAnonymous: true,
      prayerCount: 12,
    },
    {
      name: 'David R.',
      request: 'Seeking wisdom for a career transition and provision for my family.',
      isAnonymous: false,
      prayerCount: 8,
      createdBy: member._id,
    },
    {
      name: 'Anonymous',
      request: 'Pray for unity in our home and soft hearts toward one another.',
      isAnonymous: true,
      prayerCount: 15,
    },
  ]);

  await Occasion.insertMany([
    {
      type: 'birthday',
      name: 'Sarah Thompson',
      message: 'Celebrating another year of God’s faithfulness!',
      date: inDays(8),
      createdBy: member._id,
    },
    {
      type: 'anniversary',
      name: 'Michael & Rachel Chen',
      message: '15 years of covenant love.',
      date: inDays(14),
      years: 15,
    },
    {
      type: 'thanksgiving',
      name: 'The Williams Family',
      message: 'Thankful for answered prayer and a new season of hope.',
      date: inDays(3),
    },
    {
      type: 'birthday',
      name: 'Pastor James Mitchell',
      message: 'Grateful for your shepherding heart.',
      date: inDays(20),
      createdBy: pastor._id,
    },
  ]);

  await Gallery.insertMany([
    {
      title: 'Easter Sunrise',
      description: 'Morning celebration on the lawn',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      category: 'worship',
      uploadedBy: pastor._id,
    },
    {
      title: 'Baptism Sunday',
      description: 'New life in Christ',
      imageUrl: 'https://images.unsplash.com/photo-1438032005730-7a51bf9bce0d?w=800&q=80',
      category: 'events',
      uploadedBy: pastor._id,
    },
    {
      title: 'Family Picnic',
      description: 'Summer fellowship under the oaks',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
      category: 'community',
      uploadedBy: pastor._id,
    },
    {
      title: 'Mission Trip',
      description: 'Serving alongside partners abroad',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
      category: 'missions',
      uploadedBy: pastor._id,
    },
    {
      title: 'Choir Night',
      description: 'Voices lifted in praise',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      category: 'worship',
      uploadedBy: pastor._id,
    },
    {
      title: 'Kids Camp',
      description: 'Adventure and gospel fun',
      imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
      category: 'events',
      uploadedBy: pastor._id,
    },
  ]);

  console.log('Seed complete.');
  console.log('Pastor: pastor@penieleevangelicalfellowship.org / pastor123');
  console.log('Member: member@penieleevangelicalfellowship.org / member123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
