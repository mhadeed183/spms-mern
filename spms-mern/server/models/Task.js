// models/Task.js
// Each task belongs to one user (via userId foreign key).

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, required: true, trim: true },
  done:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
