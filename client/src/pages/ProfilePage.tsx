import React, { useState } from 'react';

const ProfilePage: React.FC = () => {
  const [studentNumber, setStudentNumber] = useState(localStorage.getItem('studentNumber') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [year, setYear] = useState(localStorage.getItem('year') || '');
  const [program, setProgram] = useState(localStorage.getItem('program') || '');
  const programOptions = [
    'General Science',
    'General Arts',
    'Home Economics',
    'Business',
    'Visual Arts',
    'Technical'
  ];
  const yearOptions = [
    'Form 1',
    'Form 2',
    'Form 3'
  ];
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [programSearch, setProgramSearch] = useState('');
  const [showYearModal, setShowYearModal] = useState(false);
  const [yearSearch, setYearSearch] = useState('');

  const handleSave = () => {
    setError('');
    let missing = [];
    if (!studentNumber) missing.push('Student Number');
    if (!year) missing.push('Year (Form)');
    if (!program) missing.push('Program Name');
    if (!email) missing.push('Email Address');
    else if (!/^\S+@gmail\.com$/.test(email)) missing.push('Valid @gmail.com Email');
    if (missing.length > 0) {
      setModalMessage('Please fill in: ' + missing.join(', '));
      setShowModal(true);
      return;
    }
    if (!/^[0-9]+$/.test(studentNumber)) {
      setModalMessage('Student Number must contain only numbers.');
      setShowModal(true);
      return;
    }
    localStorage.setItem('studentNumber', studentNumber);
    localStorage.setItem('email', email);
    localStorage.setItem('year', year);
    localStorage.setItem('program', program);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Profile</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500 }}>Student Number</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={studentNumber}
          onChange={e => {
            // Only allow numbers
            const val = e.target.value.replace(/[^0-9]/g, '');
            setStudentNumber(val);
          }}
          placeholder="Enter your student number"
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 8 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500 }}>Year (Form)</label>
        <input
          type="text"
          value={year}
          readOnly
          onClick={() => setShowYearModal(true)}
          placeholder="Select your year"
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 8, background: '#f9f9f9', cursor: 'pointer' }}
        />
      </div>
      {showYearModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 340, width: '90vw', textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={yearSearch}
                onChange={e => setYearSearch(e.target.value)}
                placeholder="Search year..."
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 16 }}>
              {yearOptions.filter(opt => opt.toLowerCase().includes(yearSearch.toLowerCase())).map(opt => (
                <div
                  key={opt}
                  onClick={() => { setYear(opt); setShowYearModal(false); setYearSearch(''); }}
                  style={{ padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer', fontWeight: year === opt ? 600 : 400, color: year === opt ? '#007bff' : '#333' }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <button onClick={() => setShowYearModal(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500 }}>Program Name</label>
        <input
          type="text"
          value={program}
          readOnly
          onClick={() => setShowProgramModal(true)}
          placeholder="Select your program"
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 8, background: '#f9f9f9', cursor: 'pointer' }}
        />
      </div>
      {showProgramModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 340, width: '90vw', textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={programSearch}
                onChange={e => setProgramSearch(e.target.value)}
                placeholder="Search program..."
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 16 }}>
              {programOptions.filter(opt => opt.toLowerCase().includes(programSearch.toLowerCase())).map(opt => (
                <div
                  key={opt}
                  onClick={() => { setProgram(opt); setShowProgramModal(false); setProgramSearch(''); }}
                  style={{ padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer', fontWeight: program === opt ? 600 : 400, color: program === opt ? '#007bff' : '#333' }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <button onClick={() => setShowProgramModal(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 500 }}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={e => {
            // Only allow @gmail.com
            let val = e.target.value;
            if (val && !val.endsWith('@gmail.com')) {
              if (!val.includes('@')) {
                val += '@gmail.com';
              } else {
                val = val.split('@')[0] + '@gmail.com';
              }
            }
            setEmail(val);
          }}
          placeholder="Enter your @gmail.com email address"
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 8 }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{ width: '100%', padding: 14, borderRadius: 8, background: '#007bff', color: '#fff', fontWeight: 600, border: 'none', fontSize: 16 }}
      >
        Save
      </button>
      {error && <div style={{ textAlign: 'center', color: 'red', marginTop: 16 }}>{error}</div>}
      {saved && <div style={{ textAlign: 'center', color: 'green', marginTop: 16 }}>Profile saved!</div>}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 320, textAlign: 'center' }}>
            <div style={{ marginBottom: 16, color: 'red', fontWeight: 600 }}>{modalMessage}</div>
            <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
