const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Anonymous' },
    request: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    isAnswered: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    prayerCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prayer', prayerSchema);
