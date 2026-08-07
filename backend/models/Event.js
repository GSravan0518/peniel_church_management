const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    guests: { type: Number, default: 1, min: 1 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['worship', 'youth', 'outreach', 'fellowship', 'special', 'other'],
      default: 'worship',
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    time: { type: String, default: '' },
    location: { type: String, default: 'Main Sanctuary' },
    image: { type: String, default: '' },
    capacity: { type: Number, default: 100 },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registrations: [registrationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
