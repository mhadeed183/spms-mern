// components/Grades.jsx
// GPA Tracker — per-subject marks entry, synced with the backend.
// Each edit calls PUT /api/subjects/:id (debounced via onBlur-style "Save" or live update + server sync).

import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';
import { calcSubjectResult, calcCGPA, gradeBadgeClass, gpaBadgeClass } from '../utils/gradeUtils.js';

function MarksRow({ entry, index, onChange, onRemove, canRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <input
        type="number" min="0"
        className="form-input"
        style={{ width: 80, fontFamily: 'var(--font-mono)' }}
        placeholder="Obtained"
        value={entry.obtained}
        onChange={e => onChange(index, 'obtained', e.target.value)}
      />
      <span style={{ color: 'var(--ink-faint)', fontSize: '0.8rem' }}>/</span>
      <input
        type="number" min="1"
        className="form-input"
        style={{ width: 80, fontFamily: 'var(--font-mono)' }}
        placeholder="Total"
        value={entry.total}
        onChange={e => onChange(index, 'total', e.target.value)}
      />
      {canRemove && (
        <button className="btn btn-sm btn-danger" onClick={() => onRemove(index)} style={{ padding: '5px 8px' }}>✕</button>
      )}
    </div>
  );
}

function ComponentSection({ label, weight, entries, onAdd, onUpdate, onRemove }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-soft)' }}>{label}</span>
        <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{weight}%</span>
      </div>
      {entries.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginBottom: 8 }}>No entries yet.</p>}
      {entries.map((e, i) => (
        <MarksRow key={i} entry={e} index={i} onChange={onUpdate} onRemove={onRemove} canRemove={true} />
      ))}
      <button className="btn btn-outline btn-sm" onClick={onAdd} style={{ marginTop: 4 }}>+ Add Entry</button>
    </div>
  );
}

function SingleSection({ label, weight, entry, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-soft)' }}>{label}</span>
        <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{weight}%</span>
      </div>
      <MarksRow entry={entry} index={0} onChange={(_, field, val) => onChange(field, val)} onRemove={() => {}} canRemove={false} />
    </div>
  );
}

function SubjectCard({ subject, onChange, onDelete }) {
  const result = calcSubjectResult(subject);

  function setEntries(component, entries) { onChange({ ...subject, [component]: entries }); }
  function addEntry(component) { setEntries(component, [...(subject[component] || []), { obtained: '', total: '' }]); }
  function updateEntry(component, i, field, val) {
    const updated = (subject[component] || []).map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    setEntries(component, updated);
  }
  function removeEntry(component, i) { setEntries(component, (subject[component] || []).filter((_, idx) => idx !== i)); }
  function setSingle(component, field, val) { onChange({ ...subject, [component]: { ...subject[component], [field]: val } }); }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem', minWidth: 160 }}
          placeholder="Subject name (e.g. Calculus)"
          value={subject.name}
          onChange={e => onChange({ ...subject, name: e.target.value })}
        />
        {result && (
          <>
            <span className={`badge badge-mono ${gradeBadgeClass(result.grade)}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>{result.grade}</span>
            <span className={`badge badge-mono ${gpaBadgeClass(result.gpa)}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>{result.gpa.toFixed(2)} GP</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>{result.finalPct.toFixed(1)}%</span>
          </>
        )}
        <button className="btn btn-sm btn-danger" onClick={onDelete}>Remove</button>
      </div>

      <div className="form-row" style={{ gap: 20 }}>
        <ComponentSection label="Assignments" weight={10} entries={subject.assignments || []}
          onAdd={() => addEntry('assignments')} onUpdate={(i,f,v) => updateEntry('assignments', i, f, v)} onRemove={i => removeEntry('assignments', i)} />
        <ComponentSection label="Quizzes" weight={15} entries={subject.quizzes || []}
          onAdd={() => addEntry('quizzes')} onUpdate={(i,f,v) => updateEntry('quizzes', i, f, v)} onRemove={i => removeEntry('quizzes', i)} />
        <SingleSection label="Mid Exam" weight={25} entry={subject.mid || { obtained: '', total: '' }} onChange={(f,v) => setSingle('mid', f, v)} />
        <SingleSection label="Final Exam" weight={50} entry={subject.final || { obtained: '', total: '' }} onChange={(f,v) => setSingle('final', f, v)} />
      </div>
    </div>
  );
}

export default function Grades() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    api.get('/subjects')
      .then(res => setSubjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Add a new blank subject (creates it on the backend immediately)
  async function addSubject() {
    const blank = {
      name: '',
      assignments: [{ obtained: '', total: '' }],
      quizzes:     [{ obtained: '', total: '' }],
      mid:   { obtained: '', total: '' },
      final: { obtained: '', total: '' },
    };
    try {
      const { data } = await api.post('/subjects', blank);
      setSubjects(prev => [...prev, data]);
    } catch { /* ignore */ }
  }

  // Update local state immediately (snappy UI), and sync to backend (debounced per-subject)
  const debounceTimers = React.useRef({});

  function updateSubject(id, updated) {
    setSubjects(prev => prev.map(s => s._id === id ? updated : s));

    // Debounce server sync so we don't fire a request on every keystroke
    clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      setSavingId(id);
      try {
        await api.put(`/subjects/${id}`, updated);
      } catch { /* ignore */ }
      setSavingId(null);
    }, 600);
  }

  async function deleteSubject(id) {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s._id !== id));
    } catch { /* ignore */ }
  }

  const cgpa = calcCGPA(subjects);
  const results = subjects.map(s => calcSubjectResult(s)).filter(Boolean);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">GPA Tracker</h1>
          <p className="page-desc">Loading your subjects…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">GPA Tracker</h1>
        <p className="page-desc">Enter marks per component — your GPA is calculated automatically.</p>
      </div>

      {cgpa && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--blue-600), var(--blue-900))', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 28, border: 'none',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: .75, fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase' }}>Cumulative GPA</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8rem', lineHeight: 1.1, fontWeight: 700 }}>{cgpa}</div>
            <div style={{ fontSize: '0.8rem', opacity: .7 }}>across {results.length} subject{results.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {subjects.map((s) => {
              const r = calcSubjectResult(s);
              if (!r) return null;
              return (
                <div key={s._id} style={{ textAlign: 'center', background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 16px' }}>
                  <div style={{ fontSize: '0.72rem', opacity: .8 }}>{s.name || 'Untitled'}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>{r.grade}</div>
                  <div style={{ fontSize: '0.75rem', opacity: .8, fontFamily: 'var(--font-mono)' }}>{r.gpa.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No subjects yet — add one to start tracking your GPA.</p>
          </div>
        </div>
      ) : (
        subjects.map((s) => (
          <SubjectCard
            key={s._id}
            subject={s}
            onChange={(updated) => updateSubject(s._id, updated)}
            onDelete={() => deleteSubject(s._id)}
          />
        ))
      )}

      <div className="card" style={{ marginTop: 8 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-mute)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--ink)' }}>Grading Weights: </strong>
          Assignments <strong>10%</strong> · Quizzes <strong>15%</strong> · Mid Exam <strong>25%</strong> · Final Exam <strong>50%</strong>.&nbsp;
          {savingId && <span style={{ color: 'var(--blue-600)' }}>Saving…</span>}
        </p>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={addSubject}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Subject
      </button>
    </div>
  );
}
