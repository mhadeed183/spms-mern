// pages/Login.jsx
// Combined Login / Register screen. Toggles between the two modes.
// Left panel (aside) is purely visual branding — hidden on small screens.

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { signIn, register } = useAuth();

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      return setError('Please fill in all fields.');
    }
    if (mode === 'register' && password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError(''); setPassword(''); setConfirm('');
  }

  return (
    <div className="auth-screen">
      {/* ── Left branding panel ── */}
      <aside className="auth-aside">
        <div className="auth-aside-mark">
          <div className="brand-logo">S</div>
          <span>Student PMS</span>
        </div>

        <p className="auth-aside-quote">
          Every grade, task, and deadline —<br />
          kept in <em>one ledger</em>, for every student.
        </p>

        <div className="auth-aside-foot">
          <span><strong>MERN</strong> stack</span>
          <span><strong>JWT</strong> secured</span>
          <span><strong>MongoDB</strong> backed</span>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-head">
            <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p>
              {mode === 'login'
                ? 'Sign in to pick up where you left off.'
                : 'Set up your student workspace in seconds.'}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. hadeed_23"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, padding: '11px 17px' }}>
              {loading
                ? <span className="spinner" />
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={toggleMode}>{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
          </div>
        </div>
      </main>
    </div>
  );
}
