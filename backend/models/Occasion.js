const mongoose = require('mongoose');

const occasionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['birthday', 'anniversary', 'thanksgiving'],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    message: { type: String, default: '' },
    date: { type: Date, required: true },
    years: { type: Number },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Occasion', occasionSchema);
