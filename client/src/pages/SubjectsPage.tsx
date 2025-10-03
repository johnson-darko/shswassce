import React, { useState } from 'react';

const initialSubjects = Array(4).fill('');
const initialElectives = Array(4).fill('');

const SubjectsPage: React.FC = () => {
  const [coreSubjects, setCoreSubjects] = useState(initialSubjects);
  const [electives, setElectives] = useState(initialElectives);

  const handleCoreChange = (idx: number, value: string) => {
    const updated = [...coreSubjects];
    updated[idx] = value;
    setCoreSubjects(updated);
  };

  const handleElectiveChange = (idx: number, value: string) => {
    const updated = [...electives];
    updated[idx] = value;
    setElectives(updated);
  };

  const handleSave = () => {
    localStorage.setItem('coreSubjects', JSON.stringify(coreSubjects));
    localStorage.setItem('electives', JSON.stringify(electives));
    alert('Subjects saved!');
  };

  return (
    <div style={{ maxWidth: 400, margin: '32px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Enter Your Subjects</h2>
      <div style={{ marginBottom: 24 }}>
        <h4>Core Subjects</h4>
        {coreSubjects.map((subject, idx) => (
          <input
            key={idx}
            type="text"
            value={subject}
            onChange={e => handleCoreChange(idx, e.target.value)}
            placeholder={`Core Subject ${idx + 1}`}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }}
          />
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4>Elective Subjects</h4>
        {electives.map((subject, idx) => (
          <input
            key={idx}
            type="text"
            value={subject}
            onChange={e => handleElectiveChange(idx, e.target.value)}
            placeholder={`Elective Subject ${idx + 1}`}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10 }}
          />
        ))}
      </div>
      <button onClick={handleSave} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>Save</button>
    </div>
  );
};

export default SubjectsPage;
