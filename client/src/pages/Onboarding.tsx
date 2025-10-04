import React, { useState } from 'react';
// Use public/logo.png for logo to avoid import error
const logo = '/logo.png';

const stages = [
  {
    key: 'new',
    label: 'New SHS Student (Just completed JHS and I am going to SHS)',
  },
  {
    key: 'current',
    label: 'I\'m Already in SHS',
  },
  {
    key: 'graduate',
    label: 'SHS Graduate preparing for University',
  },
];

const shsSchools = [
  // TODO: Replace with full list or fetch from data
  'Achimota School', 'Wesley Girls High School', 'Prempeh College', 'Mfantsipim School', 'St. Augustine\'s College', 'Holy Child School', 'Adisadel College', 'Opoku Ware School', 'Presbyterian Boys\' Secondary', 'Aburi Girls', 'Keta SHTS', 'Labone SHS', 'Accra Academy', 'St. Louis SHS', 'Tamale SHS', 'Ghana National College', 'St. Peter\'s SHS', 'St. Mary\'s SHS', 'Kumasi High School', 'Osei Kyeretwie SHS', 'Others...'
];

const prospectusChecklist = {
  'Achimota School': ['Chop Box', 'Trunk', 'Blanket', 'Bed Sheets', 'Pillow', 'Cutlery', 'Bucket', 'Toiletries', 'School Uniform', 'Sandals', 'Shoes', 'Others...'],
  'Wesley Girls High School': ['Chop Box', 'Trunk', 'Bed Sheets', 'Pillow', 'Cutlery', 'Bucket', 'Toiletries', 'School Uniform', 'Sandals', 'Shoes', 'Others...'],
  // ...add for other schools
  'Others...': ['Chop Box', 'Trunk', 'Bed Sheets', 'Pillow', 'Cutlery', 'Bucket', 'Toiletries', 'School Uniform', 'Sandals', 'Shoes', 'Others...'],
};

interface OnboardingProps {
  startingScreen?: number;
}

const Onboarding: React.FC<OnboardingProps> = ({ startingScreen = 1 }) => {
  const [showShopModal, setShowShopModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [screen, setScreen] = useState(startingScreen);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [search, setSearch] = useState('');

  // Save all onboarding data to localStorage
  function saveOnboardingData(data: any) {
    // Only one of 'current' (with school) or 'graduate' can be saved at a time
    let newData: any = {};
    if (data.stage === 'current') {
      newData = { stage: 'current', school: data.school };
    } else if (data.stage === 'graduate') {
      newData = { stage: 'graduate' };
    } else if (data.stage === 'new') {
      newData = { stage: 'new' };
      if (data.school) newData.school = data.school;
    } else if (data.school) {
      // For new SHS student school selection
      const prev = JSON.parse(localStorage.getItem('onboarding') || '{}');
      newData = { ...prev, school: data.school };
    }
    localStorage.setItem('onboarding', JSON.stringify(newData));
  }

  // Screen 1: Welcome
  if (screen === 1) {
    return (
      <div style={{ maxWidth: 420, margin: '48px auto', padding: 32, background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
          <img src={logo} alt="Logo" style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: '50%', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} />
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 32, marginBottom: 10, color: '#222', letterSpacing: '-1px' }}>Own Your Future from High School</h1>
        <p style={{ color: '#444', fontWeight: 500, fontSize: 18, marginBottom: 28 }}>Welcome! Start your journey to success.</p>
        <button
          onClick={() => setScreen(2)}
          style={{ padding: '14px 40px', borderRadius: 10, background: 'linear-gradient(90deg,#007bff 0%,#00c6fb 100%)', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', marginTop: 18, boxShadow: '0 2px 8px rgba(0,123,255,0.10)', cursor: 'pointer', letterSpacing: '0.5px' }}
        >
          Get Started
        </button>
      </div>
    );
  }

  // Screen 2: Select Stage
  if (screen === 2) {
    return (
      <div style={{ maxWidth: 420, margin: '48px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Select Your Stage</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {stages.map(stage => (
            <button
              key={stage.key}
              onClick={() => {
                setSelectedStage(stage.key);
                if (stage.key === 'new') {
                  saveOnboardingData({ stage: 'new' });
                  setScreen(3);
                } else if (stage.key === 'current') {
                  setScreen(3);
                } else if (stage.key === 'graduate') {
                  saveOnboardingData({ stage: 'graduate' });
                  window.location.replace('/shswassce/#/calculator');
                }
              }}
              style={{ padding: '16px 18px', borderRadius: 8, background: '#e0eaff', color: '#007bff', fontWeight: 600, fontSize: 16, border: '1px solid #b3d1ff', marginBottom: 8 }}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Screen 3: Choose School (for new SHS students)
  if (screen === 3) {
    const filteredSchools = shsSchools.filter(s => s.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ maxWidth: 420, margin: '48px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Choose Your School</h2>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search SHS schools..."
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 18 }}
        />
        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 18 }}>
          {filteredSchools.map(school => (
            <div
              key={school}
              onClick={() => {
                setSelectedSchool(school);
                if (selectedStage === 'current') {
                  saveOnboardingData({ stage: 'current', school });
                  window.location.replace('/');
                } else {
                  saveOnboardingData({ school });
                  setScreen(4);
                }
              }}
              style={{ padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer', fontWeight: school === selectedSchool ? 700 : 500, color: school === selectedSchool ? '#007bff' : '#333' }}
            >
              {school}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Screen 4: Prospectus Setup
  if (screen === 4) {
    const school = selectedSchool || JSON.parse(localStorage.getItem('onboarding') || '{}').school || 'Others...';
  const checklist = prospectusChecklist[school as keyof typeof prospectusChecklist] || prospectusChecklist['Others...'];
    return (
      <div style={{ maxWidth: 420, margin: '48px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>{school} Prospectus</h2>
        <div style={{ textAlign: 'left', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Checklist</h3>
          <ul style={{ paddingLeft: 18 }}>
            {checklist.map((item: string) => (
              <li key={item} style={{ marginBottom: 8 }}>
                <input type="checkbox" style={{ marginRight: 8 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setShowPaymentModal(true)}
          style={{ padding: '12px 32px', borderRadius: 8, background: '#ff9800', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginBottom: 12 }}
        >
          Order Full Package with Hischo (Pay with MoMo)
        </button>

        <button
          onClick={() => setShowShopModal(true)}
          style={{ padding: '12px 32px', borderRadius: 8, background: '#007bff', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginBottom: 12 }}
        >
          Shop for Chop Box Items
        </button>

        {showShopModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 0, maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', textAlign: 'center', position: 'relative', width: '90vw', height: '80vh', display: 'flex', flexDirection: 'column' }}>
              <button onClick={() => setShowShopModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', zIndex: 2 }}>&times;</button>
              <h2 style={{ fontWeight: 700, fontSize: 20, margin: '18px 0 8px 0' }}>Shop for Chop Box Items</h2>
              <iframe
                src="https://paystack.shop/hischo-shs-prosoectus"
                title="Hischo SHS Prospectus Shop"
                style={{ flex: 1, width: '100%', border: 'none', borderRadius: 8 }}
              />
            </div>
          </div>
        )}

        {showPaymentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 380, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', textAlign: 'center', position: 'relative' }}>
              <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
              <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Payment Instructions</h2>
              <p style={{ marginBottom: 16, fontWeight: 500, color: '#333' }}>
                Please use your <b>student BECE index number</b> as reference and also your <b>full name</b> when making payment.<br /><br />
                Make sure the <b>total sum</b> of the payment is paid.<br /><br />
                We will deliver the items to you when school resumes, so make sure you are present in the first 2 days of the school reporting day.
              </p>
              <button
                style={{ padding: '12px 32px', borderRadius: 8, background: '#007bff', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginTop: 18 }}
                onClick={() => {}}
              >
                Pay Now
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Onboarding;
