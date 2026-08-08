const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true, trim: true },
    phoneDigits: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['member', 'pastor', 'admin'], default: 'member' },
    birthday: { type: Date },
    anniversary: { type: Date },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('validate', function setPhoneDigits() {
  this.phone = String(this.phone || '').trim();
  this.phoneDigits = digitsOnly(this.phone);
  if (!this.phoneDigits) {
    this.invalidate('phone', 'Phone number is required');
  }
});

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.statics.digitsOnly = digitsOnly;

userSchema.statics.findByEmailOrPhone = async function findByEmailOrPhone(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;

  if (raw.includes('@')) {
    return this.findOne({ email: raw.toLowerCase() });
  }

  const digits = digitsOnly(raw);
  if (!digits) return null;

  return this.findOne({ phoneDigits: digits });
};

module.exports = mongoose.model('User', userSchema);
