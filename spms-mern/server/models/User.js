// models/User.js
// Mongoose schema for a registered student user.
// Password is stored as a bcrypt hash — never plain text.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  // Profile info (editable from the Profile page)
  profile: {
    name:     { type: String, default: '' },
    semester: { type: String, default: '' },
    image:    { type: String, default: '' }, // base64 data URL
  },
}, { timestamps: true });

// Hash the password before saving to DB
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper: compare a plain-text attempt with the stored hash
UserSchema.methods.matchPassword = async function (attempt) {
  return bcrypt.compare(attempt, this.password);
};

module.exports = mongoose.model('User', UserSchema);
