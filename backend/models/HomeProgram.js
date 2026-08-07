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

module.exports = mongoose.model('HomeProgram', homeProgramSchema);
