// components/Profile.jsx
// Edits Name, Semester, and Profile Image. Saves to the backend via PUT /api/auth/profile.

import React, { useState } from 'react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const profile = user?.profile || {};

  const [name,     setName]     = useState(profile.name     || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [image,    setImage]    = useState(profile.image    || '');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setImage(evt.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!name.trim()) return alert('Please enter your name.');
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim(), semester: semester.trim(), image });
      updateProfile(data.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-desc">Set up your student identity and preferences.</p>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'var(--blue-100)', border: '3px solid var(--blue-200)',
          overflow: 'hidden', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '2rem', fontWeight: 700,
          color: 'var(--blue-700)', flexShrink: 0,
        }}>
          {image
            ? <img src={image} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.4rem' }}>
            {name || user?.username}
          </h2>
          <p style={{ color: 'var(--ink-mute)', fontSize: '0.875rem', marginTop: 4 }}>
            {semester ? `Semester ${semester}` : 'Semester not set'} · @{user?.username}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Edit Details</h2>
            <p className="card-subtitle">Changes are saved to your account in the database.</p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ali Hassan" />
          </div>
          <div className="form-group">
            <label className="form-label">Current Semester</label>
            <input className="form-input" value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. 4th" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Profile Picture</label>
          <input type="file" accept="image/*" className="form-input" style={{ padding: '7px 12px' }} onChange={handleImageUpload} />
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner" /> : (saved ? '✓ Saved!' : 'Save Profile')}
        </button>
      </div>
    </div>
  );
}
