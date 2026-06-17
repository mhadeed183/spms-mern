// routes/auth.js
// POST /api/auth/register  — create a new account
// POST /api/auth/login     — get a JWT token

const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: sign a JWT that expires in 7 days
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required' });

  try {
    const exists = await User.findOne({ username: username.trim().toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Username already taken' });

    const user  = await User.create({ username: username.trim().toLowerCase(), password });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, username: user.username, profile: user.profile } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required' });

  try {
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid username or password' });

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, profile: user.profile } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update Profile ────────────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, semester, image } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile: { name, semester, image } },
      { new: true }
    ).select('-password');
    res.json({ profile: user.profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
