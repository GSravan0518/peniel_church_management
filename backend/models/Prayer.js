const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    request: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    isAnswered: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    prayerCount: { type: Number, default: 0 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prayer', prayerSchema);
