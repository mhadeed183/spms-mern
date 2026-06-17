// components/Sidebar.jsx
// Left navigation panel. Highlights the active page.

import React from 'react';

const icons = {
  home:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  user:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  grades:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
};

const PAGES = [
  { id: 'home',    label: 'Daily Tasks', icon: icons.home   },
  { id: 'profile', label: 'My Profile',  icon: icons.user   },
  { id: 'grades',  label: 'GPA Tracker', icon: icons.grades },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <nav className="sidebar">
      <span className="sidebar-section-label">Menu</span>
      {PAGES.map(p => (
        <button
          key={p.id}
          className={`nav-item ${activePage === p.id ? 'active' : ''}`}
          onClick={() => onNavigate(p.id)}
        >
          {p.icon}
          {p.label}
        </button>
      ))}
    </nav>
  );
}
