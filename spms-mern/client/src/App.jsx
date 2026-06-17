// App.jsx
// Root component. Wraps everything in AuthProvider.
// If not logged in → show Login page.
// If logged in → show the dashboard shell (Header + Sidebar + active page).

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login   from './pages/Login.jsx';
import Header  from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Profile from './components/Profile.jsx';
import Tasks   from './components/Tasks.jsx';
import Grades  from './components/Grades.jsx';

function Dashboard() {
  const [activePage, setActivePage] = useState('home');

  function renderPage() {
    switch (activePage) {
      case 'home':    return <Tasks key="tasks" />;
      case 'profile': return <Profile key="profile" />;
      case 'grades':  return <Grades key="grades" />;
      default:        return <Tasks key="tasks" />;
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
        <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
