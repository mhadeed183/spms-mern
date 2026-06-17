// components/Tasks.jsx
// Daily Task Manager — full CRUD against the backend:
//   GET /api/tasks · POST /api/tasks · PUT /api/tasks/:id · DELETE /api/tasks/:id

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderRadius: 'var(--r-sm)',
      background: task.done ? 'var(--paper-sunk)' : 'var(--paper)',
      border: '1.5px solid',
      borderColor: task.done ? 'var(--line)' : 'var(--blue-100)',
      transition: 'all 0.15s',
      animation: 'fadeIn .2s ease',
    }}>
      <button
        onClick={() => onToggle(task)}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          border: '2px solid', borderColor: task.done ? 'var(--green-fg)' : 'var(--blue-400)',
          background: task.done ? 'var(--green-fg)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        aria-label="Toggle done"
      >
        {task.done && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <span style={{
        flex: 1, fontSize: '0.9rem', fontWeight: 500,
        color: task.done ? 'var(--ink-faint)' : 'var(--ink)',
        textDecoration: task.done ? 'line-through' : 'none',
        transition: 'all 0.15s',
      }}>
        {task.text}
      </span>

      <span className={`badge ${task.done ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
        {task.done ? 'Done' : 'Pending'}
      </span>

      <button className="btn btn-icon btn-danger" onClick={() => onDelete(task._id)} aria-label="Delete task" style={{ padding: 6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks]   = useState([]);
  const [input, setInput]   = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load tasks from the backend once, on mount
  useEffect(() => {
    api.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addTask() {
    const text = input.trim();
    if (!text) return;
    try {
      const { data } = await api.post('/tasks', { text });
      setTasks(prev => [data, ...prev]);
      setInput('');
    } catch { /* could show a toast here */ }
  }

  function handleKeyDown(e) { if (e.key === 'Enter') addTask(); }

  async function toggleTask(task) {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { done: !task.done });
      setTasks(prev => prev.map(t => t._id === task._id ? data : t));
    } catch { /* ignore */ }
  }

  async function deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch { /* ignore */ }
  }

  const visible = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done')    return  t.done;
    return true;
  });

  const doneCount    = tasks.filter(t =>  t.done).length;
  const pendingCount = tasks.filter(t => !t.done).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Daily Tasks</h1>
        <p className="page-desc">Manage your day — stay on top of everything.</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',   value: tasks.length },
          { label: 'Pending', value: pendingCount },
          { label: 'Done',    value: doneCount },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex: '1 1 100px', padding: '16px 20px', minWidth: 100 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title">Add New Task</h2></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you need to do today?"
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={addTask}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Task List</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all','pending','done'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading tasks…</p></div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{tasks.length === 0 ? 'No tasks yet — add one above!' : `No ${filter} tasks.`}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visible.map(task => (
              <TaskItem key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
