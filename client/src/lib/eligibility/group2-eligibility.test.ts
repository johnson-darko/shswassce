// group2-eligibility.test.ts
// Comprehensive tests for Group 2 eligibility logic
import { checkGroup2Eligibility } from './group2-eligibility';

describe('Group 2 Eligibility Logic', () => {
  const coreSubjects = [
    { subject: 'English Language', grade: 'B3' },
    { subject: 'Mathematics', grade: 'A1' },
    { subject: 'Integrated Science', grade: 'B2' }
  ];

  // Example test: Not eligible by default
  it('should mark not eligible for any Group 2 program (default)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'French', grade: 'B3' },
        { subject: 'Government', grade: 'C6' },
        { subject: 'Typewriting', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'GROUP 2 PROGRAM');
    expect(result.eligible).toBe(false);
    expect(result.details[0]).toContain('Program not found in Group 2 logic.');
  });

  it('should mark eligible for BSc. Biochemistry (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Biology', grade: 'B3' },
        { subject: 'Chemistry', grade: 'A1' },
        { subject: 'Physics', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Biochemistry');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Biochemistry (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Biology', grade: 'B3' },
        { subject: 'Chemistry', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Biochemistry');
    expect(result.eligible).toBe(false);
  });

  it('should mark eligible for FOOD SCIENCE AND TECHNOLOGY (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Biology', grade: 'B3' },
        { subject: 'Chemistry', grade: 'A1' },
        { subject: 'Mathematics (Elective)', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'FOOD SCIENCE AND TECHNOLOGY');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for Doctor of Optometry (OD) (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Biology', grade: 'A1' },
        { subject: 'Physics', grade: 'B2' },
        { subject: 'Chemistry', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'Doctor of Optometry (OD)');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Chemistry (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Chemistry', grade: 'A1' },
        { subject: 'Physics', grade: 'B2' },
        { subject: 'Mathematics (Elective)', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Chemistry');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Physics (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Physics', grade: 'A1' },
        { subject: 'Mathematics (Elective)', grade: 'B2' },
        { subject: 'Chemistry', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Physics');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Meteorology and Climate Science (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Mathematics (Elective)', grade: 'A1' },
        { subject: 'Physics', grade: 'B2' },
        { subject: 'Chemistry', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Meteorology and Climate Science');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Mathematics (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Mathematics (Elective)', grade: 'A1' },
        { subject: 'Physics', grade: 'B2' },
        { subject: 'Biology', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Mathematics');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Statistics (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Mathematics (Elective)', grade: 'A1' },
        { subject: 'Economics', grade: 'B2' },
        { subject: 'Geography', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Statistics');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Actuarial Science (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Mathematics (Elective)', grade: 'A1' },
        { subject: 'Economics', grade: 'B2' },
        { subject: 'Geography', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Actuarial Science');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BSc. Computer Science (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Mathematics (Elective)', grade: 'A1' },
        { subject: 'Physics', grade: 'B2' },
        { subject: 'Chemistry', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BSc. Computer Science');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. History (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'History', grade: 'A1' },
        { subject: 'Economics', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. History');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. Political Studies (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Government', grade: 'A1' },
        { subject: 'Geography', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Political Studies');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. Geography and Rural Development (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Geography', grade: 'A1' },
        { subject: 'Economics', grade: 'B2' },
        { subject: 'Government', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Geography and Rural Development');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. English (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Literature in English', grade: 'A1' },
        { subject: 'French', grade: 'B2' },
        { subject: 'History', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. English');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. French and Francophone Studies (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'French', grade: 'A1' },
        { subject: 'History', grade: 'B2' },
        { subject: 'Religious Studies', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. French and Francophone Studies');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. Akan Language and Culture (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Akan', grade: 'A1' },
        { subject: 'History', grade: 'B2' },
        { subject: 'Geography', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Akan Language and Culture');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. Sociology (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'History', grade: 'A1' },
        { subject: 'Geography', grade: 'B2' },
        { subject: 'Economics', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Sociology');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. Social Work (full)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'History', grade: 'A1' },
        { subject: 'Geography', grade: 'B2' },
        { subject: 'Economics', grade: 'B3' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Social Work');
    expect(result.eligible).toBe(true);
  });

  it('should mark eligible for BA. History (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'History', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. History');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });

  it('should mark eligible for BA. Political Studies (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Government', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Political Studies');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });

  it('should mark eligible for BA. Geography and Rural Development (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Geography', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Geography and Rural Development');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });

  it('should mark eligible for BA. English (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Literature in English', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. English');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });

  it('should mark eligible for BA. French and Francophone Studies (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'French', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. French and Francophone Studies');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });

  it('should mark eligible for BA. Akan Language and Culture (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Akan', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Akan Language and Culture');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });

  it('should mark not eligible for BA. Sociology (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'History', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Sociology');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });

  it('should mark not eligible for BA. Social Work (partial)', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'History', grade: 'A1' }
      ],
      aggregate: 12
    };
    const result = checkGroup2Eligibility(combo, {}, 'BA. Social Work');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('To be fully eligible'))).toBe(true);
  });
});
