// routes/subjects.js
// GET    /api/subjects        — get all subjects for logged-in user
// POST   /api/subjects        — create a new subject
// PUT    /api/subjects/:id    — update a subject's marks
// DELETE /api/subjects/:id    — delete a subject

const express = require('express');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const subject = await Subject.create({ userId: req.user._id, ...req.body });
    res.status(201).json(subject);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
