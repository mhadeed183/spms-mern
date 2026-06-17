// models/Subject.js
// One document = one subject for one user.
// Stores all mark components needed for GPA calculation.

const mongoose = require('mongoose');

// Generic {obtained, total} entry used for all mark components
const MarkEntry = {
  obtained: { type: Number, default: 0 },
  total:    { type: Number, default: 0 },
};

const SubjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:   { type: String, default: '' },

  // Multiple entries allowed for assignments and quizzes
  assignments: [MarkEntry],
  quizzes:     [MarkEntry],

  // Single entry for mid and final exams
  mid:   MarkEntry,
  final: MarkEntry,
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
