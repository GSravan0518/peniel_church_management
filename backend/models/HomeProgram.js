const mongoose = require('mongoose');

const EVENT_TYPES = [
  'birthday_prayer',
  'marriage_anniversary',
  'thanksgiving_prayer',
  'house_warming',
  'healing_prayer',
  'family_prayer',
  'dedication',
  'other_occasion',
];

const homeProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    place: { type: String, required: true, trim: true },
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    date: { type: Date, required: true },
    /** Calendar day YYYY-MM-DD (stable across timezones) */
    dateKey: { type: String, trim: true, index: true },
    /** Display/store time in 12-hour format, e.g. "10:30 AM" */
    time12h: { type: String, required: true, trim: true },
    timeOfDay: { type: String, enum: ['AM', 'PM'], required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

homeProgramSchema.statics.EVENT_TYPES = EVENT_TYPES;
homeProgramSchema.statics.TIME_12H_REGEX = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

module.exports = mongoose.model('HomeProgram', homeProgramSchema);
