// group1-eligibility.test.ts
// Comprehensive tests for Group 1 eligibility logic
import { checkGroup1Eligibility } from './group1-eligibility';

describe('Group 1 Eligibility Logic', () => {
  const coreSubjects = [
    { subject: 'English Language', grade: 'B3' },
    { subject: 'Mathematics', grade: 'A1' },
    { subject: 'Integrated Science', grade: 'B2' }
  ];

  // This test checks if a student is eligible for Packaging Technology when they pick 3 correct subjects.
  it('should mark eligible for BSC. PACKAGING TECHNOLOGY with correct electives', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Physics', grade: 'B3' },
        { subject: 'Visual Art', grade: 'C6' },
        { subject: 'Technical', grade: 'B2' }
      ],
      aggregate: 10
    };
    const result = checkGroup1Eligibility(combo, {}, 'BSC. PACKAGING TECHNOLOGY');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('Before you apply'))).toBe(true);
  });

  // This test checks if a student is NOT eligible for Packaging Technology when they pick less than 3 subjects.
  it('should mark not eligible for BSC. PACKAGING TECHNOLOGY with less than 3 electives', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Physics', grade: 'B3' },
        { subject: 'Visual Art', grade: 'C6' }
      ],
      aggregate: 10
    };
    const result = checkGroup1Eligibility(combo, {}, 'BSC. PACKAGING TECHNOLOGY');
    expect(result.eligible).toBe(false);
  });

  // This test checks if a student is eligible for BA. Integrated Rural Art and Industry when they pick 3 Group A subjects.
  it('should handle BA. INTEGRATED RURAL ART AND INDUSTRY Group A', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Picture Making', grade: 'B3' },
        { subject: 'Textiles', grade: 'C6' },
        { subject: 'Ceramics', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup1Eligibility(combo, {}, 'BA. INTEGRATED RURAL ART AND INDUSTRY');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('Group A passes'))).toBe(true);
  });

  // This test checks if a student is eligible for BA. Integrated Rural Art and Industry when they pick 3 Group B technical subjects.
  it('should handle BA. INTEGRATED RURAL ART AND INDUSTRY Group B', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Welding and Fabrication Technology', grade: 'B3' },
        { subject: 'Digital Design Technology', grade: 'C6' },
        { subject: 'Industrial Mechanics', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup1Eligibility(combo, {}, 'BA. INTEGRATED RURAL ART AND INDUSTRY');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('Group B passes'))).toBe(true);
  });

  // This test checks if a student is NOT eligible for BA. Integrated Rural Art and Industry when they pick subjects NOT in Group A or B.
  it('should mark not eligible for BA. INTEGRATED RURAL ART AND INDUSTRY with wrong electives', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Economics', grade: 'B3' },
        { subject: 'History', grade: 'C6' },
        { subject: 'Business', grade: 'B2' }
      ],
      aggregate: 12
    };
    const result = checkGroup1Eligibility(combo, {}, 'BA. INTEGRATED RURAL ART AND INDUSTRY');
    expect(result.eligible).toBe(false);
  });

  // This test checks if a student is eligible for Religion and Human Development when they have CRS and 2 other electives.
  it('should mark eligible for BA. RELIGION AND HUMAN DEVELOPMENT with CRS and 2 other electives', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Christian Religious Studies', grade: 'B3' },
        { subject: 'History', grade: 'C6' },
        { subject: 'Geography', grade: 'B2' }
      ],
      aggregate: 10
    };
    const result = checkGroup1Eligibility(combo, {}, 'BA. RELIGION AND HUMAN DEVELOPMENT');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('CRS found.'))).toBe(true);
  });

  // This test checks if a student is eligible for Religion and Human Development when they have IRS and 2 other electives.
  it('should mark eligible for BA. RELIGION AND HUMAN DEVELOPMENT with IRS and 2 other electives', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'Islamic Religious Studies', grade: 'B3' },
        { subject: 'History', grade: 'C6' },
        { subject: 'Geography', grade: 'B2' }
      ],
      aggregate: 10
    };
    const result = checkGroup1Eligibility(combo, {}, 'BA. RELIGION AND HUMAN DEVELOPMENT');
    expect(result.eligible).toBe(true);
    expect(result.details.some(d => d.includes('IRS found.'))).toBe(true);
  });

  // This test checks if a student is NOT eligible for Religion and Human Development when they do NOT have CRS or IRS.
  it('should mark not eligible for BA. RELIGION AND HUMAN DEVELOPMENT without CRS/IRS', () => {
    const combo = {
      coreSubjects,
      electiveSubjects: [
        { subject: 'History', grade: 'C6' },
        { subject: 'Geography', grade: 'B2' },
        { subject: 'Economics', grade: 'B3' }
      ],
      aggregate: 10
    };
    const result = checkGroup1Eligibility(combo, {}, 'BA. RELIGION AND HUMAN DEVELOPMENT');
    expect(result.eligible).toBe(false);
    expect(result.details.some(d => d.includes('CRS/IRS not found.'))).toBe(true);
  });

  // This test checks if a student is NOT eligible for Packaging Technology when they are missing a core subject.
  it('should mark not eligible if missing core subjects', () => {
    const combo = {
      coreSubjects: [
        { subject: 'English Language', grade: 'B3' },
        { subject: 'Mathematics', grade: 'A1' }
      ],
      electiveSubjects: [
        { subject: 'Physics', grade: 'B3' },
        { subject: 'Visual Art', grade: 'C6' },
        { subject: 'Technical', grade: 'B2' }
      ],
      aggregate: 10
    };
    const result = checkGroup1Eligibility(combo, {}, 'BSC. PACKAGING TECHNOLOGY');
    expect(result.eligible).toBe(false);
  });
});
