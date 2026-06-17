// utils/gradeUtils.js
// All grading math lives here — import these wherever needed.

/**
 * Given a final percentage (0–100), return the letter grade and GPA point.
 */
export function getGrade(pct) {
  if (pct >= 85) return { letter: 'A',  gpa: 4.00 };
  if (pct >= 80) return { letter: 'A-', gpa: 3.66 };
  if (pct >= 75) return { letter: 'B+', gpa: 3.33 };
  if (pct >= 71) return { letter: 'B',  gpa: 3.00 };
  if (pct >= 68) return { letter: 'B-', gpa: 2.66 };
  if (pct >= 64) return { letter: 'C+', gpa: 2.33 };
  if (pct >= 61) return { letter: 'C',  gpa: 2.00 };
  if (pct >= 58) return { letter: 'C-', gpa: 1.66 };
  if (pct >= 54) return { letter: 'D+', gpa: 1.30 };
  if (pct >= 50) return { letter: 'D',  gpa: 1.00 };
  return           { letter: 'F',  gpa: 0.00 };
}

/**
 * Average a list of {total, obtained} entries into a percentage (0–100).
 */
export function avgPct(entries) {
  const valid = (entries || []).filter(e => Number(e.total) > 0);
  if (!valid.length) return null;
  const totalMarks    = valid.reduce((s, e) => s + Number(e.total),    0);
  const totalObtained = valid.reduce((s, e) => s + Number(e.obtained), 0);
  return (totalObtained / totalMarks) * 100;
}

/**
 * Calculate the weighted final percentage for a subject.
 * Weights: Assignments 10% · Quizzes 15% · Mid 25% · Final 50%
 */
export function calcSubjectResult(subject) {
  const components = [
    { weight: 10, pct: avgPct(subject.assignments) },
    { weight: 15, pct: avgPct(subject.quizzes) },
    { weight: 25, pct: avgPct(subject.mid   ? [subject.mid]   : []) },
    { weight: 50, pct: avgPct(subject.final ? [subject.final] : []) },
  ];

  const active = components.filter(c => c.pct !== null);
  if (!active.length) return null;

  const activeWeightSum = active.reduce((s, c) => s + c.weight, 0);
  const weightedSum = active.reduce(
    (s, c) => s + (c.pct * (c.weight / activeWeightSum)), 0
  );

  const finalPct = Math.min(100, Math.max(0, weightedSum));
  const { letter, gpa } = getGrade(finalPct);
  return { finalPct, grade: letter, gpa };
}

/** CGPA = average of all subject GPAs */
export function calcCGPA(subjects) {
  const results = subjects.map(calcSubjectResult).filter(Boolean);
  if (!results.length) return null;
  const sum = results.reduce((s, r) => s + r.gpa, 0);
  return (sum / results.length).toFixed(2);
}

export function gpaBadgeClass(gpa) {
  if (gpa >= 3.5) return 'badge-green';
  if (gpa >= 2.5) return 'badge-blue';
  if (gpa >= 1.5) return 'badge-yellow';
  return 'badge-red';
}

export function gradeBadgeClass(letter) {
  if (['A','A-'].includes(letter))      return 'badge-green';
  if (['B+','B','B-'].includes(letter)) return 'badge-blue';
  if (['C+','C','C-'].includes(letter)) return 'badge-yellow';
  return 'badge-red';
}
