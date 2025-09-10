// Group 1 eligibility logic for KNUST programs
// To add a new program to Group 1:
  // 1. Confirm the program's requirements match the Group 1 pattern (core subjects: English, Mathematics, Integrated Science; electives:or any 3 from the allowed groups or technical list).
  // 2. Add the program name and its eligible groups/message to the group1Map below, using UPPERCASE for the key.
  // 3. Reference the program name in the main eligibility logic so it uses checkGroup1Eligibility.
  // 4. No need to duplicate logic—just update group1Map and ensure the main file routes the program to this function.
   // 5. Add it to the program and requirements, append to it

import { gradeToNumber } from '../offline-eligibility-engine';

export type Group1EligibilityResult = { eligible: boolean, details: string[] };

export const group1Map: Record<string, { groups: string[], message: string }> = {
  'BSC. PACKAGING TECHNOLOGY': {
    groups: ['Science', 'General Arts', 'Visual Art', 'Technical', 'Home Economics'],
    message: 'Before you apply for this program, make sure you have 3 passed electives and has to be a student from Science, General Arts, Visual Art, Technical or Home Economics.'
  },
  'BA. METAL PRODUCT DESIGN TECHNOLOGY': {
    groups: ['Visual Art', 'Home Economics', 'Technical', 'Science'],
    message: 'Before you apply for this program, make sure you have 3 passed electives and has to be a student from Visual Art, Home Economics, Technical or Science.'
  },
  'BSC. TEXTILE DESIGN AND TECHNOLOGY': {
    groups: ['Visual Art', 'Home Economics', 'Technical', 'Science', 'General Arts', 'Business'],
    message: 'Before you apply for this program, make sure you have 3 passed electives and has to be a student from Visual Art, Home Economics, Technical, Science, General Arts or Business.'
  },
  'BSC. FASHION DESIGN': {
    groups: ['Visual Art', 'Home Economics', 'Technical', 'Science', 'General Arts', 'Business'],
    message: 'Before you apply for this program, make sure you have 3 passed electives and has to be a student from Visual Art, Home Economics, Technical, Science, General Arts or Business.'
  },
  'BFA. CERAMICS': {
    groups: ['Visual Art', 'Home Economics', 'General Arts'],
    message: 'Before you apply for this program, make sure you have 3 passed electives and has to be a student from Visual Art, Home Economics or General Arts.'
  },
  'B.ED. (ART AND DESIGN TECHNOLOGY)': {
    groups: ['Visual Arts', 'Vocational', 'Science', 'Technical', 'General Arts'],
    message: 'Before you apply for this program, make sure you have 3 passed electives and has to be a student from Visual Arts, Vocational, Science, Technical or General Arts.'
  },
    'BSC. DISABILITY AND REHABILITATION STUDIES': {
      groups: ['General Science', 'General Arts', 'Business', 'Visual Art', 'Home Economics'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from General Science, General Arts, Business, Visual Art or Home Economics.'
    },
    'BACHELOR OF PUBLIC ADMINISTRATION': {
      groups: ['General Arts', 'Business', 'General Science', 'Home Economics', 'Visual Art'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from General Arts, Business, General Science, Home Economics or Visual Art.'
    },
    'BACHELOR OF LAW (LLB)': {
      groups: ['General Arts', 'Business', 'Visual Art', 'General Science'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from General Arts, Business, Visual Art or General Science.'
    },
    'BSC. BUSINESS ADMINISTRATION (HUMAN RESOURCE MANAGEMENT/MANAGEMENT)': {
      groups: ['Business', 'General Arts', 'General Science', 'Vocational/Home Economics'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from Business, General Arts, General Science, or Vocational/Home Economics.'
    },
    'BSC. BUSINESS ADMINISTRATION (MARKETING/INTERNATIONAL BUSINESS)': {
      groups: ['Business', 'General Arts', 'General Science', 'Vocational/Home Economics'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from Business, General Arts, General Science, or Vocational/Home Economics.'
    },
    'BSC. HOSPITALITY AND TOURISM MANAGEMENT': {
      groups: ['Business', 'General Arts', 'General Science', 'Vocational/Home Economics'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from Business, General Arts, General Science, or Vocational/Home Economics.'
    },
    'BSC. BUSINESS ADMINISTRATION (ACCOUNTING/BANKING AND FINANCE)': {
      groups: ['Business', 'General Arts', 'General Science'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from Business, General Arts, or General Science.'
    },
    'BSC. BUSINESS ADMINISTRATION (LOGISTICS AND SUPPLY CHAIN MANAGEMENT/BUSINESS INFORMATION TECHNOLOGY)': {
      groups: ['Business', 'General Arts', 'General Science'],
      message: 'Before you apply for this program, make sure you have 3 passed electives from Business, General Arts, or General Science.'
    },
};

// Explanations for eligibility messages (for popups/modals)
export const group1Explanations: Record<string, string> = {
  'BSC. PACKAGING TECHNOLOGY':
    'To apply for Packaging Technology:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Science\n  - General Arts\n  - Visual Art\n  - Technical\n  - Home Economics\n\n• If you have 3 passes in any one group, you are eligible!',
  'BA. METAL PRODUCT DESIGN TECHNOLOGY':
    'To apply for Metal Product Design Technology:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Visual Art\n  - Home Economics\n  - Technical\n  - Science\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. TEXTILE DESIGN AND TECHNOLOGY':
    'To apply for Textile Design and Technology:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Visual Art\n  - Home Economics\n  - Technical\n  - Science\n  - General Arts\n  - Business\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. FASHION DESIGN':
    'To apply for Fashion Design:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Visual Art\n  - Home Economics\n  - Technical\n  - Science\n  - General Arts\n  - Business\n\n• If you have 3 passes in any one group, you are eligible!',
  'BFA. CERAMICS':
    'To apply for Ceramics:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Visual Art\n  - Home Economics\n  - General Arts\n\n• If you have 3 passes in any one group, you are eligible!',
  'B.ED. (ART AND DESIGN TECHNOLOGY)':
    'To apply for Art and Design Technology:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Visual Arts\n  - Vocational\n  - Science\n  - Technical\n  - General Arts\n\n• If you have 3 passes in any one group, you are eligible!',
  'BA. INTEGRATED RURAL ART AND INDUSTRY':
    'To apply for Integrated Rural Art and Industry:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Group A: Visual Art, Home Economics, General Arts, Science, Business\n  - Group B: Technical or Creative Art subjects (Welding, Digital Design, Industrial Mechanics, etc.)\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. DISABILITY AND REHABILITATION STUDIES':
    'To apply for Disability and Rehabilitation Studies:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - General Science\n  - General Arts\n  - Business\n  - Visual Art\n  - Home Economics\n\n• If you have 3 passes in any one group, you are eligible!',
  'BACHELOR OF PUBLIC ADMINISTRATION':
    'To apply for Public Administration:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - General Arts\n  - Business\n  - General Science\n  - Home Economics\n  - Visual Art\n\n• If you have 3 passes in any one group, you are eligible!',
  'BA. RELIGION AND HUMAN DEVELOPMENT':
    'To apply for Religion and Human Development:\n\n• You must have passed Christian Religious Studies (CRS) or Islamic Religious Studies (IRS)\n• You must also have 2 other General Arts electives with C6 or better\n\n• If you have these, you are eligible!',
  'BACHELOR OF LAW (LLB)':
    'To apply for Law (LLB):\n\n• You must have passed 3 elective subjects from one of these groups:\n  - General Arts\n  - Business\n  - Visual Art\n  - General Science\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. BUSINESS ADMINISTRATION (HUMAN RESOURCE MANAGEMENT/MANAGEMENT)':
    'To apply for Business Administration (HR/Management):\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Business\n  - General Arts\n  - General Science\n  - Vocational/Home Economics\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. BUSINESS ADMINISTRATION (MARKETING/INTERNATIONAL BUSINESS)':
    'To apply for Business Administration (Marketing/International Business):\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Business\n  - General Arts\n  - General Science\n  - Vocational/Home Economics\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. HOSPITALITY AND TOURISM MANAGEMENT':
    'To apply for Hospitality and Tourism Management:\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Business\n  - General Arts\n  - General Science\n  - Vocational/Home Economics\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. BUSINESS ADMINISTRATION (ACCOUNTING/BANKING AND FINANCE)':
    'To apply for Business Administration (Accounting/Banking and Finance):\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Business\n  - General Arts\n  - General Science\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. BUSINESS ADMINISTRATION (LOGISTICS AND SUPPLY CHAIN MANAGEMENT/BUSINESS INFORMATION TECHNOLOGY)':
    'To apply for Business Administration (Logistics/Supply Chain/Business IT):\n\n• You must have passed 3 elective subjects from one of these groups:\n  - Business\n  - General Arts\n  - General Science\n\n• If you have 3 passes in any one group, you are eligible!'
};

export function checkGroup1Eligibility(combo: any, requirement: any, programName: string): Group1EligibilityResult {
  // Core: English, Mathematics, Integrated Science
  const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
  const hasEnglish = coreSubjects.includes('english language');
  const hasMath = coreSubjects.includes('mathematics');
  const hasScience = coreSubjects.includes('integrated science');
  let coreEligible = hasEnglish && hasMath && hasScience;
  let coreDetails: string[] = [];
  if (!coreEligible) {
    coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
}

  // Elective logic
  const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
  let electivesEligible = false;
  let electivesDetails: string[] = [];

  // For BA. Integrated Rural Art and Industry, use a large subject list (Group A/B)
  if (programName === 'BA. INTEGRATED RURAL ART AND INDUSTRY') {
    const groupA = [
      'picture making', 'leatherwork', 'graphic design', 'textiles', 'jewellery', 'basketry', 'sculpture', 'ceramics', 'general knowledge in art', 'management in living', 'clothing & textiles', 'food and nutrition', 'physics', 'chemistry', 'mathematics (elective)', 'biology', 'religious studies', 'construction', 'economics', 'history', 'akan', 'geography', 'literature in english', 'business management', 'accounting', 'costing', 'ict'
    ];
    const groupB = [
      'welding and fabrication technology', 'digital design technology', 'industrial mechanics', 'wood construction technology', 'furniture design and construction', 'creative art technology', 'building construction technology', 'general textiles', 'fashion design technology', 'visual communication technology'
    ];
    const groupAElig = electives.filter((e: any) => groupA.includes(e.subject.trim().toLowerCase()));
    const groupBElig = electives.filter((e: any) => groupB.includes(e.subject.trim().toLowerCase()));
    electivesEligible = groupAElig.length >= 3 || groupBElig.length >= 3;
    electivesDetails.push(`Group A passes: ${groupAElig.length}, Group B passes: ${groupBElig.length}`);
    if (electivesEligible) {
      electivesDetails.push(groupAElig.length >= 3 ? 'You qualify via Group A.' : 'You qualify via Group B.');
    } else {
      electivesDetails.push('You need at least 3 passes from Group A or Group B subjects.');
    }
    } else if (programName === 'BA. RELIGION AND HUMAN DEVELOPMENT') {
      // Custom logic: eligible if all core subjects and CRS or IRS present; hint if less than 2 additional General Arts electives
      const crsOrIrs = electives.find((e: any) => ['christian religious studies', 'crs', 'islamic religious studies', 'irs'].includes(e.subject.trim().toLowerCase()));
      const otherElectives = electives.filter((e: any) => !['christian religious studies', 'crs', 'islamic religious studies', 'irs'].includes(e.subject.trim().toLowerCase()));
      const hasCRS = electives.some((e: any) => ['christian religious studies', 'crs'].includes(e.subject.trim().toLowerCase()));
      const hasIRS = electives.some((e: any) => ['islamic religious studies', 'irs'].includes(e.subject.trim().toLowerCase()));
      electivesEligible = !!crsOrIrs;
      electivesDetails.push(hasCRS ? 'CRS found.' : hasIRS ? 'IRS found.' : 'CRS/IRS not found.');
      if (!crsOrIrs) {
        electivesDetails.push('You must have Christian Religious Studies (CRS) or Islamic Religious Studies (IRS) as an elective.');
      }
      if (otherElectives.length < 2) {
        electivesDetails.push('To be fully eligible, you should also have at least C6 in two additional General Arts electives.');
      }
  } else {
    // For other programs, just check count of eligible electives
    const groupInfo = group1Map[programName];
    electivesEligible = electives.length >= 3;
    if (groupInfo) {
      electivesDetails.push(groupInfo.message);
      electivesDetails.push(`Eligible electives: ${electives.length}`);
      if (!electivesEligible) {
        electivesDetails.push('You need at least 3 passes from eligible electives.');
      }
    } else {
      electivesDetails.push(`Eligible electives: ${electives.length}`);
      if (!electivesEligible) {
        electivesDetails.push('You need at least 3 passes from eligible electives.');
      }
    }
  }

  let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
  return {
    eligible: coreEligible && electivesEligible && aggregateEligible,
    details: [...coreDetails, ...electivesDetails]
  };
}
