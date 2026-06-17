// routes/tasks.js
// All routes are protected — only authenticated users can access their own tasks.
// GET    /api/tasks        — get all tasks for logged-in user
// POST   /api/tasks        — create a new task
// PUT    /api/tasks/:id    — toggle done / edit text
// DELETE /api/tasks/:id    — delete a task

const express = require('express');
const Task    = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect); // Apply auth guard to every route below

// Get all tasks for this user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create a task
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({ userId: req.user._id, text: req.body.text });
    res.status(201).json(task);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update a task (toggle done or edit text)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // ensure ownership
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
