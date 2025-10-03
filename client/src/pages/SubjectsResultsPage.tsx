import React, { useState, useEffect } from 'react';
// Reuse gradeValues from calculator page
// Exportable function to calculate average aggregate from results object
export function calculateAverageAggregate(results: Record<string, any>) {
  const aggregates: number[] = [];
  Object.values(results).forEach((v) => {
    const coreGrades = v.coreGrades || [];
    const electives = v.electives || [];
    const electiveGrades = v.electiveGrades || [];
    const agg = getAggregate(coreGrades, electives, electiveGrades);
    if (agg && typeof agg.aggregate === 'number') {
      aggregates.push(agg.aggregate);
    }
  });
  if (aggregates.length === 0) return null;
  const sum = aggregates.reduce((a, b) => a + b, 0);
  return Math.round((sum / aggregates.length) * 100) / 100;
}
const gradeValues: Record<string, number> = {
  'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
};

function getAggregate(coreGrades: string[], electives: string[], electiveGrades: string[]) {
  // Map core subjects to grades
  const coreData = [
    { subject: 'English', grade: coreGrades[0] },
    { subject: 'Core Mathematics', grade: coreGrades[1] },
    { subject: 'Integrated Science', grade: coreGrades[2] },
    { subject: 'Social Studies', grade: coreGrades[3] }
  ];
  // Map electives to grades
  const electiveData = [0,1,2,3].map(i => ({ subject: electives[i], grade: electiveGrades[i] }));
  // Only valid grades
  const validCore = coreData.filter(item => gradeValues[item.grade] && gradeValues[item.grade] <= 6);
  const validElective = electiveData.filter(item => gradeValues[item.grade] && gradeValues[item.grade] <= 6 && item.subject);
  if (validCore.length < 4 || validElective.length < 3) return null;
  // Aggregate: sum of all 4 core + best 3 electives
  const coreTotal = validCore.reduce((sum, item) => sum + gradeValues[item.grade], 0);
  const sortedElectives = validElective.sort((a, b) => gradeValues[a.grade] - gradeValues[b.grade]);
  const bestElectives = sortedElectives.slice(0, 3);
  const electiveTotal = bestElectives.reduce((sum, item) => sum + gradeValues[item.grade], 0);
  return {
    aggregate: coreTotal + electiveTotal,
    coreGrades: validCore,
    bestElectives,
  };
}

const yearOptions = ['Form 1', 'Form 2', 'Form 3'];
const termOptions = ['Term 1', 'Term 2'];
const coreSubjectNames = [
  'English',
  'Core Mathematics',
  'Integrated Science',
  'Social Studies'
];
const initialSubjects = coreSubjectNames;
  const electiveSubjectOptions = [
    "Accounting",
    "Akan", 
    "Animal Husbandry",
    "Applied Electricity",
    "Applied Electronics",
    "Arabic",
    "Auto Mechanics",
    "Basic Electronics", 
    "Basic/Applied Electricity",
    "Basketry",
    "Biology",
    "Building Construction",
    "Business Management",
    "Business Mathematics",
    "Ceramics",
    "Chemistry",
    "Clerical Office Duties",
    "Clothing and Textiles",
    "Costing",
    "Crop Husbandry",
    "Economics",
    "Electricity/Applied Electricity",
    "Electronics",
    "Engineering Science",
    "Financial Accounting",
    "Foods and Nutrition",
    "Forestry",
    "French",
    "General Agriculture",
    "General Knowledge In Art",
    "Geography",
    "Ghanaian Language",
    "Government",
    "Graphic Design",
    "History",
    "Horticulture",
    "ICT (Elective)",
    "Information Communication Technology",
    "Introduction to Business Management",
    "Jewellery",
    "Leatherwork",
    "Literature in English",
    "Making",
    "Management-In-Living",
    "Mathematics (Elective)",
    "Metalwork",
    "Music",
    "Painting",
    "Physics",
    "Picture Making",
    "Principles of Cost Accounting",
    "Principles of Costing",
    "Religious Studies",
    "Sculpture",
    "Technical Drawing",
    "Textiles",
    "Typewriting (40wpm)",
    "Welding and Fabrication",
    "Woodwork"
  ].sort();
  const initialElectives = Array(4).fill('');
const initialGrades = Array(4).fill('');

function getSavedResults() {
  const data = localStorage.getItem('studentResults');
  return data ? JSON.parse(data) : {};
}

const SubjectsResultsPage: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [showAverageModal, setShowAverageModal] = useState(false);

  // Helper to calculate average grade for a subject across all terms
  function getAverageSubjectGrade(
    results: Record<string, {
      coreGrades: string[];
      electiveGrades: string[];
    }>,
    subjectIdx: number,
    isCore: boolean
  ): string | null {
    const grades = Object.values(results)
      .map(v => {
        const res = v as { coreGrades: string[]; electiveGrades: string[] };
        return isCore ? (res.coreGrades && res.coreGrades[subjectIdx]) : (res.electiveGrades && res.electiveGrades[subjectIdx]);
      })
      .filter(g => g && gradeValues[g]);
    if (grades.length === 0) return null;
    const avg = grades.reduce((a, b) => a + gradeValues[b], 0) / grades.length;
    // Find closest grade label
    const closest = Object.entries(gradeValues).reduce((prev, curr) => Math.abs(curr[1] - avg) < Math.abs(gradeValues[prev] - avg) ? curr[0] : prev, 'A1');
    return closest;
  }
  const [showAllResultsModal, setShowAllResultsModal] = useState(false);
  const [showCoreErrorModal, setShowCoreErrorModal] = useState(false);
  const [coreErrorMsg, setCoreErrorMsg] = useState('');
  const [showElectiveErrorModal, setShowElectiveErrorModal] = useState(false);
  const [electiveErrorMsg, setElectiveErrorMsg] = useState('');
  const [showElectiveSubjectModal, setShowElectiveSubjectModal] = useState([-1]);
  const [electiveSearchValue, setElectiveSearchValue] = useState('');
  const [showElectiveModal, setShowElectiveModal] = useState(false);
  const [electiveSearch, setElectiveSearch] = useState(['']);
  const gradeOptions = [
    'A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'
  ];
  const [year, setYear] = useState(yearOptions[0]);
  const [term, setTerm] = useState(termOptions[0]);
  const [coreSubjects] = useState(coreSubjectNames);
  const [coreGrades, setCoreGrades] = useState(initialGrades);
  const [showCoreModal, setShowCoreModal] = useState(false);
  const [electives, setElectives] = useState(['']);
  const [electiveGrades, setElectiveGrades] = useState(['']);
  const [results, setResults] = useState(getSavedResults());

  useEffect(() => {
    // Load saved data for selected year/term
    const key = `${year}_${term}`;
    if (results[key]) {
      setCoreGrades(results[key].coreGrades || initialGrades);
      setElectives(results[key].electives || initialElectives);
      setElectiveGrades(results[key].electiveGrades || initialGrades);
    } else {
      setCoreGrades(initialGrades);
      setElectives(initialElectives);
      setElectiveGrades(initialGrades);
    }
  }, [year, term, results]);

  const handleSave = () => {
    const key = `${year}_${term}`;
    const updated = {
      ...results,
      [key]: {
        coreSubjects,
        coreGrades,
        electives,
        electiveGrades,
      },
    };
    setResults(updated);
    localStorage.setItem('studentResults', JSON.stringify(updated));
    alert('Results saved for ' + year + ' ' + term);
  };

  return (
    <div style={{ maxWidth: 420, margin: '32px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <button
        onClick={() => setShowAverageModal(true)}
        style={{ width: '100%', padding: 12, borderRadius: 8, background: '#e0eaff', color: '#007bff', border: '1px solid #b3d1ff', fontWeight: 600, marginBottom: 12 }}
      >
        View Average Aggregate & Subject Grades
      </button>

      {/* Get elective subject names from the first available term */}
      {/* useState for showInfo should NOT be inside JSX, only inside the component function body */}
      {/* Show average aggregate above the table if available */}
      {typeof calculateAverageAggregate(results) === 'number' && (
        <div style={{ marginBottom: 12, fontWeight: 600, color: '#007bff', fontSize: 18 }}>
          Average Aggregate: {calculateAverageAggregate(results)}
        </div>
      )}
      <button
        onClick={() => setShowAllResultsModal(true)}
        style={{ width: '100%', padding: 12, borderRadius: 8, background: '#e0eaff', color: '#007bff', border: '1px solid #b3d1ff', fontWeight: 600, marginBottom: 18 }}
      >
        View All Results
      </button>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Enter Your Results</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <select value={year} onChange={e => setYear(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
          {yearOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={term} onChange={e => setTerm(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
          {termOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4>Core Subjects & Grades</h4>
        <button onClick={() => setShowCoreModal(true)} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#eee', color: '#333', border: '1px solid #ddd', fontWeight: 500, marginBottom: 10 }}>Enter Core Grades</button>
        {showCoreModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 340, width: '90vw', textAlign: 'center' }}>
              <h4 style={{ marginBottom: 16 }}>Core Subjects Grades</h4>
              {coreSubjectNames.map((subject, idx) => (
                <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ flex: 2, textAlign: 'left' }}>{subject}</span>
                  <select
                    value={coreGrades[idx]}
                    onChange={e => {
                      const updated = [...coreGrades];
                      updated[idx] = e.target.value;
                      setCoreGrades(updated);
                    }}
                    style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
                  >
                    <option value="">Select Grade</option>
                    {gradeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                onClick={() => {
                  const missing = 4 - coreGrades.filter(g => g && g.trim()).length;
                  if (missing > 0) {
                    setCoreErrorMsg(`Please select ${missing} more core grade${missing > 1 ? 's' : ''}.`);
                    setShowCoreErrorModal(true);
                  } else {
                    setShowCoreModal(false);
                  }
                }}
                style={{ marginTop: 12, padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}
              >Done</button>
      {showCoreErrorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 320, width: '90vw', textAlign: 'center' }}>
            <h4 style={{ marginBottom: 16, color: '#d00' }}>Incomplete Core Grades</h4>
            <div style={{ marginBottom: 16 }}>{coreErrorMsg}</div>
            <button onClick={() => setShowCoreErrorModal(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>OK</button>
          </div>
        </div>
      )}
            </div>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 24 }}>
        <h4>Elective Subjects & Grades</h4>
        <button onClick={() => setShowElectiveModal(true)} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#eee', color: '#333', border: '1px solid #ddd', fontWeight: 500, marginBottom: 10 }}>Enter Elective Subjects & Grades</button>
        {showElectiveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 340, width: '90vw', textAlign: 'center' }}>
              <h4 style={{ marginBottom: 16 }}>Elective Subjects & Grades</h4>
              {electives.map((subject, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => { setShowElectiveSubjectModal([idx]); setElectiveSearchValue(''); }}
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', background: '#f9f9f9', marginBottom: 8, textAlign: 'left' }}
                  >
                    {subject ? subject : 'Select Elective Subject'}
                  </button>
                  {showElectiveSubjectModal[0] === idx && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                      <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 340, width: '90vw', textAlign: 'center' }}>
                        <input
                          type="text"
                          value={electiveSearchValue}
                          onChange={e => setElectiveSearchValue(e.target.value)}
                          placeholder="Search elective..."
                          style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd', marginBottom: 12 }}
                        />
                        <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 12 }}>
                          {electiveSubjectOptions.filter(opt => opt.toLowerCase().includes(electiveSearchValue.toLowerCase())).map(opt => (
                            <div
                              key={opt}
                              onClick={() => {
                                const updated = [...electives];
                                updated[idx] = opt;
                                setElectives(updated);
                                setShowElectiveSubjectModal([-1]);
                              }}
                              style={{ padding: '10px 0', borderBottom: '1px solid #eee', cursor: 'pointer', fontWeight: subject === opt ? 600 : 400, color: subject === opt ? '#007bff' : '#333' }}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setShowElectiveSubjectModal([-1])} style={{ padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>Close</button>
                      </div>
                    </div>
                  )}
                  <select
                    value={electiveGrades[idx] || ''}
                    onChange={e => {
                      const updated = [...electiveGrades];
                      updated[idx] = e.target.value;
                      setElectiveGrades(updated);
                    }}
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
                  >
                    <option value="">Select Grade</option>
                    {gradeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
              {electives.length < 4 && (
                <button
                  onClick={() => {
                    setElectives([...electives, '']);
                    setElectiveGrades([...electiveGrades, '']);
                  }}
                  style={{ width: '100%', padding: 10, borderRadius: 8, background: '#e0eaff', color: '#007bff', border: '1px solid #b3d1ff', fontWeight: 500, marginBottom: 10 }}
                >+ Add Elective</button>
              )}
              <button
                onClick={() => {
                  const missing = 4 - electives.filter(e => e && e.trim()).length;
                  if (missing > 0) {
                    setElectiveErrorMsg(`Please select ${missing} more elective${missing > 1 ? 's' : ''}.`);
                    setShowElectiveErrorModal(true);
                  } else {
                    setShowElectiveModal(false);
                  }
                }}
                style={{ marginTop: 12, padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}
              >Done</button>
      {showElectiveErrorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 320, width: '90vw', textAlign: 'center' }}>
            <h4 style={{ marginBottom: 16, color: '#d00' }}>Incomplete Electives</h4>
            <div style={{ marginBottom: 16 }}>{electiveErrorMsg}</div>
            <button onClick={() => setShowElectiveErrorModal(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>OK</button>
          </div>
        </div>
      )}
            </div>
          </div>
        )}
      </div>
      <button onClick={handleSave} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>Save</button>
      {showAverageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 400, width: '95vw', textAlign: 'center', position: 'relative' }}>
            <h3 style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Average Aggregate & Subject Grades
              <span
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', position: 'relative' }}
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onClick={() => setShowInfo((v) => !v)}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#007bff" strokeWidth="2" fill="#e0eaff" />
                  <text x="10" y="14" textAnchor="middle" fontSize="12" fill="#007bff" fontFamily="Arial" fontWeight="bold">i</text>
                </svg>
                {showInfo && (
                  <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', background: '#f8faff', color: '#333', border: '1px solid #b3d1ff', borderRadius: 8, padding: '12px 16px', fontSize: 14, width: 320, zIndex: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <strong>How are these calculated?</strong><br /><br />
                    <b>Average Aggregate:</b> The aggregate score for each term is calculated as the sum of the best 4 core subject grades and the best 3 elective grades (using WAEC grade points). The average aggregate is the mean of all term aggregates.<br /><br />
                    <b>Average Subject Grade:</b> For each subject, the average grade is found by converting all grades to WAEC points, averaging them across all terms, and mapping back to the closest grade label.
                  </div>
                )}
              </span>
            </h3>
            <div style={{ marginBottom: 16, fontWeight: 600, color: '#007bff', fontSize: 18 }}>
              Average Aggregate: {calculateAverageAggregate(results) ?? '-'}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
              <thead>
                <tr style={{ background: '#f0f4ff' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Subject</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Average Grade</th>
                </tr>
              </thead>
              <tbody>
                {coreSubjectNames.map((sub, idx) => (
                  <tr key={sub}>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{sub}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{getAverageSubjectGrade(results, idx, true) ?? '-'}</td>
                  </tr>
                ))}
                {/* Dynamically show elective subject names from first available term */}
                {(() => {
                  const firstTermKey = Object.keys(results)[0];
                  const electives: string[] = firstTermKey && results[firstTermKey]?.electives ? results[firstTermKey].electives : [];
                  return electives.map((sub: string, idx: number) => (
                    <tr key={sub || idx}>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{sub || `Elective ${idx+1}`}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{getAverageSubjectGrade(results, idx, false) ?? '-'}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            <button onClick={() => setShowAverageModal(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}
      {showAllResultsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 600, width: '95vw', textAlign: 'center', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: 18 }}>All Results</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
              <thead>
                <tr style={{ background: '#f0f4ff' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Year</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Term</th>
                  {coreSubjectNames.map(sub => (
                    <th key={sub} style={{ padding: 8, border: '1px solid #eee' }}>{sub}</th>
                  ))}
                  {[1,2,3,4].map(i => (
                    <th key={i} style={{ padding: 8, border: '1px solid #eee' }}>{`Elective ${i}`}</th>
                  ))}
                  <th style={{ padding: 8, border: '1px solid #eee', color: '#007bff' }}>Aggregate</th>
                  <th style={{ padding: 8, border: '1px solid #eee', color: '#d00' }}>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([key, value]) => {
                  const [yr, tm] = key.split('_');
                  const v = value as {
                    coreGrades?: string[];
                    electives?: string[];
                    electiveGrades?: string[];
                  };
                  const agg = getAggregate(
                    v.coreGrades || [],
                    v.electives || [],
                    v.electiveGrades || []
                  );
                  let feedback = '';
                  let feedbackColor = '#d00';
                  if (agg) {
                    // Use all 4 core and all 4 electives for feedback
                    const allCore = [
                      { subject: 'English', grade: v.coreGrades && v.coreGrades[0] },
                      { subject: 'Core Mathematics', grade: v.coreGrades && v.coreGrades[1] },
                      { subject: 'Integrated Science', grade: v.coreGrades && v.coreGrades[2] },
                      { subject: 'Social Studies', grade: v.coreGrades && v.coreGrades[3] }
                    ];
                    const allElective = [0,1,2,3].map(i => ({ subject: v.electives && v.electives[i], grade: v.electiveGrades && v.electiveGrades[i] }));
                    const poorCore = allCore.filter(item => item.grade && gradeValues[item.grade] > 6);
                    const poorElective = allElective.filter(item => item.grade && gradeValues[item.grade] > 6 && item.subject);
                    if (poorCore.length === 0 && poorElective.length === 0) {
                      feedback = 'All grades are pass marks!';
                      feedbackColor = 'green';
                    } else {
                      const subjects = [...poorCore.map(item => item.subject), ...poorElective.map(item => item.subject)].filter(Boolean);
                      if (subjects.length === 1) {
                        feedback = `Try to improve your grade in ${subjects[0]}`;
                      } else if (subjects.length === 2) {
                        feedback = `Try to improve your grade in ${subjects[0]} and ${subjects[1]}`;
                      } else {
                        feedback = `Try to improve your grade in ${subjects.slice(0, -1).join(', ')} or ${subjects[subjects.length - 1]}`;
                      }
                      feedbackColor = '#d00';
                    }
                  } else {
                    feedback = 'Not enough valid grades';
                    feedbackColor = '#d00';
                  }
                  return (
                    <tr key={key}>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{yr}</td>
                      <td style={{ padding: 8, border: '1px solid #eee' }}>{tm}</td>
                      {coreSubjectNames.map((_, idx) => (
                        <td key={idx} style={{ padding: 8, border: '1px solid #eee' }}>{v.coreGrades && v.coreGrades[idx] ? v.coreGrades[idx] : '-'}</td>
                      ))}
                      {[0,1,2,3].map(i => (
                        <td key={i} style={{ padding: 8, border: '1px solid #eee' }}>{v.electives && v.electives[i] ? `${v.electives[i]} (${v.electiveGrades && v.electiveGrades[i] ? v.electiveGrades[i] : '-'})` : '-'}</td>
                      ))}
                      <td style={{ padding: 8, border: '1px solid #eee', color: '#007bff', fontWeight: 600 }}>{agg ? agg.aggregate : '-'}</td>
                      <td style={{ padding: 8, border: '1px solid #eee', color: feedbackColor, fontWeight: 500 }}>{feedback}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button onClick={() => setShowAllResultsModal(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsResultsPage;
