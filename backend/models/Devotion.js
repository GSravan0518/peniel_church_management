const mongoose = require('mongoose');

const devotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    scripture: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Pastor' },
    date: { type: Date, default: Date.now },
    image: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Devotion', devotionSchema);
