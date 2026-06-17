// index.js — Express + MongoDB server entry point

// ── DNS Overrides (Forces Public DNS) ─────────────────────────────────────────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces Node to use Google's Public DNS globally

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes     = require('./routes/auth');
const taskRoutes     = require('./routes/tasks');
const subjectRoutes  = require('./routes/subjects');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Production CORS Configuration ─────────────────────────────────────────────
// This whitelist allows both your local testing setup and your deployed Vercel site
const allowedOrigins = [
  'http://localhost:5173',
  'https://spms-mern.vercel.app'
];

app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: '5mb' })); // 5mb to allow base64 profile images

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/subjects', subjectRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ── Connect to MongoDB and start server ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });