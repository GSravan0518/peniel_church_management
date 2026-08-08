const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HomeProgram',
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    hostName: { type: String, required: true },
    place: { type: String, required: true },
    eventType: { type: String, required: true },
    date: { type: Date, required: true },
    time12h: { type: String, required: true },
    notes: { type: String, default: '' },
    phone: { type: String, default: '' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

calendarEventSchema.index({ date: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
