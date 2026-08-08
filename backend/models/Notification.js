const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'home_program_request',
        'prayer_request',
        'weekly_digest',
        'day_of_program',
        'calendar_reminder',
        'general',
      ],
      default: 'general',
    },
    forRole: { type: String, enum: ['pastor', 'admin', 'member'], default: 'pastor' },
    isRead: { type: Boolean, default: false },
    weekStart: { type: Date },
    weekEnd: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
