const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes     = require('./routes/auth');
const taskRoutes     = require('./routes/tasks');
const subjectRoutes  = require('./routes/subjects');

const app  = express();
const PORT = process.env.PORT || 8080; // Handles Railway's port dynamically

// ── Middlewares ───────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── CORS ───────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://spms-mern.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Routes ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subjects', subjectRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ── MongoDB Connection + Single Server Boot ────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // ONLY listen here, and explicitly use '0.0.0.0' so Railway can route traffic!
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server securely running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });