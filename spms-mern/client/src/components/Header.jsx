// components/Header.jsx
// Top navigation bar — brand, current user's avatar/name, and logout.

import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const profile = user?.profile;

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (user?.username?.[0]?.toUpperCase() || 'S');

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-logo">S</div>
        <span className="brand-title">Student PMS</span>
      </div>

      <div className="topbar-user">
        <div className="topbar-avatar">
          {profile?.image ? <img src={profile.image} alt="avatar" /> : initials}
        </div>
        <span className="topbar-name">{profile?.name || user?.username}</span>

        <button className="topbar-logout" onClick={logout}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log out
        </button>
      </div>
    </header>
  );
}
