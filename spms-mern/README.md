# 🎓 Student Personal Management System — MERN Edition

A full-stack student productivity app: **MongoDB + Express + React + Node**, with secure multi-user login.

## ✨ What's New in This Version
- **Multi-user accounts** — Register/Login with username + password (JWT-secured)
- **MongoDB persistence** — all data (profile, tasks, subjects) is stored per-user in the database, not just the browser
- **Modernized UI** — new typography (Fraunces + Inter + JetBrains Mono), softer elevation/shadows, a branded split-screen login page, and a "ledger" mono treatment for grades
- Same core features as before: Profile, Daily Task Manager, GPA Tracker

## 🗂️ Project Structure
```
spms-mern/
├── server/        ← Express + MongoDB API
│   ├── models/     (User, Task, Subject)
│   ├── routes/     (auth, tasks, subjects)
│   ├── middleware/ (JWT auth guard)
│   └── index.js
└── client/        ← React + Vite frontend
    └── src/
        ├── context/   (AuthContext — global login state)
        ├── pages/     (Login)
        ├── components/ (Header, Sidebar, Profile, Tasks, Grades)
        ├── utils/     (api.js, gradeUtils.js)
        └── App.jsx
```

## 🚀 Getting Started

### 1. Set up MongoDB
You need a MongoDB connection string. Easiest options:
- **Local**: install MongoDB Community Server, it runs at `mongodb://localhost:27017`
- **Cloud (free)**: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), copy your connection string

### 2. Start the backend
```bash
cd server
npm install
cp .env.example .env
# edit .env and paste your MONGO_URI + a JWT_SECRET
npm run dev
```
Server runs at `http://localhost:5000`.

### 3. Start the frontend
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173` (Vite proxies `/api` calls to the backend automatically).

### 4. Use the app
Open the browser, click **Sign up**, create an account, and you're in. Every user only sees their own tasks, subjects, and profile.

## 🔐 How Authentication Works
1. On register/login, the server creates a **JWT token** (a signed string proving who you are) and sends it back.
2. The client stores this token in `localStorage` and attaches it to every API request as `Authorization: Bearer <token>`.
3. The server's `protect` middleware checks this token on every protected route, and only returns data belonging to that specific user.
4. Passwords are never stored in plain text — they're hashed with **bcrypt** before saving to MongoDB.

## 🧮 Grading Weights (unchanged)
| Component   | Weight |
|-------------|--------|
| Assignments | 10%    |
| Quizzes     | 15%    |
| Mid Exam    | 25%    |
| Final Exam  | 50%    |

## 🛠️ Tech Stack
- **M**ongoDB — database
- **E**xpress — backend API framework
- **R**eact — frontend UI
- **N**ode.js — JavaScript runtime
- JWT + bcrypt for authentication & security
