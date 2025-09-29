// Custom eligibility logic for KNUST programs
import { gradeToNumber, normalizeSubjectName } from '../offline-eligibility-engine';

// Explanations for custom eligibility messages (for popups/modals)
export const customExplanations: Record<string, string> = {
  'BSC. LANDSCAPE DESIGN AND MANAGEMENT':
    'To apply for Landscape Design and Management:\n\n• You must have passed 3 elective subjects from ONE group only:\n  - Science: Chemistry, Physics or Mathematics (Elective) or Crop Husbandry, Biology or General Agriculture\n  - General Arts: Mathematics (Elective), Geography, Economics, Technical Drawing, General Knowledge in Art\n  - Visual Art: General Knowledge in Art, Graphic Design, Chemistry, Picture Making, Painting, Sculpture\n\n• If you have 3 passes in any one group, you are eligible!',
  'BSC. NATURAL RESOURCE MANAGEMENT':
    'To apply for Natural Resource Management:\n\n• You must have passed Chemistry, Physics or Mathematics, and Biology or General Agriculture as electives.\n• All core subjects (English, Mathematics, Integrated Science) are required.\n',
  'BSC. FOREST RESOURCE TECHNOLOGY':
    'To apply for Forest Resource Technology:\n\n• You must have passed Chemistry, Physics or Mathematics, and Biology or General Agriculture as electives.\n• All core subjects (English, Mathematics, Integrated Science) are required.\n',
  'BSC. AQUACULTURE AND WATER RESOURCE MANAGEMENT':
    'To apply for Aquaculture and Water Resource Management:\n\n• You must have passed Chemistry, Physics or Mathematics, and Biology or General Agriculture as electives.\n• All core subjects (English, Mathematics, Integrated Science) are required.\n',
  'BSC. AGRIBUSINESS MANAGEMENT':
    'To apply for Agribusiness Management:\n\n• You must have passed 3 electives from ONE group only:\n  - Science: Chemistry, Physics or Mathematics (Elective), Biology or General Agriculture\n  - Business: Economics, Accounting, Business Management, Business Mathematics, Costing, Mathematics (Elective) [Integrated Science must be at least B3]\n  - General Arts: Economics, Geography, Mathematics (Elective) [Integrated Science must be at least B3]\n  - General Agriculture: Chemistry, Physics or Mathematics (Elective), Biology or General Agriculture or Crop Husbandry or Horticulture\n',
  'BSC. LAND ECONOMY':
    'To apply for Land Economy:\n\n• Option 1: Pass Economics, Geography, and one of: Accounting, Business Management, Government, Business Mathematics, French, Literature in English, History, Building Construction, Technical Drawing, Mathematics (Elective).\n• Option 2: Pass Economics and any two of: Elective Mathematics, Geography, Accounting, Business Management, Business Mathematics, Government, French, Building Construction, Technical Drawing, General Knowledge in Art.\n',
  'BSC. REAL ESTATE':
    'To apply for Real Estate:\n\n• Option 1: Pass Economics, Geography, and one of: Accounting, Business Management, Government, Business Mathematics, French, Literature in English, History, Building Construction, Technical Drawing, Mathematics (Elective).\n• Option 2: Pass Economics and any two of: Elective Mathematics, Geography, Accounting, Business Management, Business Mathematics, Government, French, Building Construction, Technical Drawing, General Knowledge in Art.\n',
  'BSC. ARCHITECTURE':
    'To apply for Architecture:\n\n• Must have Mathematics (Elective) and any TWO groups from Technical, General Science, Visual Art, General Arts (with at least one subject from each group).\n• All core subjects (English, Mathematics, Integrated Science) are required.\n',
};

export function checkCustomEligibility(combo: any, requirement: any, programName: string) {
  // Custom logic for BSc. Quantity Surveying and Construction Economics (Building Technology)
  if (programName === 'BSC. QUANTITY SURVEYING AND CONSTRUCTION ECONOMICS (BUILDING TECHNOLOGY)') {
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    let details: string[] = [];
    details.push('To apply for Quantity Surveying and Construction Economics (Building Technology):\n\n• You must have passed Mathematics (Elective) and any TWO (2) from: Chemistry, Economics, Geography, Technical Drawing, Building Construction, Physics.');
    // Check for Mathematics (Elective)
    const hasMathElective = electives.some((e: any) => e.subject.trim().toLowerCase() === 'mathematics (elective)');
    // Check for any two from the flat list
    const allowedSubjects = ['chemistry', 'economics', 'geography', 'technical drawing', 'building construction', 'physics'];
    const passedAllowed = electives.filter((e: any) => allowedSubjects.includes(e.subject.trim().toLowerCase()));
    let electivesEligible = hasMathElective && passedAllowed.length >= 2;
    if (!hasMathElective) {
      details.push('Missing required elective: Mathematics (Elective)');
    }
    if (passedAllowed.length < 2) {
      details.push('Missing required electives: Any TWO (2) from Chemistry, Economics, Geography, Technical Drawing, Building Construction, Physics.');
    }
    if (electivesEligible) {
      details.push(`You qualified using: Mathematics (Elective), and ${passedAllowed.map((e: any) => `${e.subject} (${e.grade})`).join(', ')}`);
    } else {
      details.push(`Your electives: ${electives.map((e: any) => `${e.subject} (${e.grade})`).join(', ')}`);
    }
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    return {
      eligible: electivesEligible && aggregateEligible,
      details
    };
  }
  // Custom logic for BSc. Construction Technology and Management (Building Technology)
  if (programName === 'BSC. CONSTRUCTION TECHNOLOGY AND MANAGEMENT (BUILDING TECHNOLOGY)') {
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    let details: string[] = [];
    // Always include requirements explanation first
    details.push('To apply for Construction Technology and Management (Building Technology):\n\n• You must have passed Mathematics (Elective) and any TWO (2) from:\n  - Technical: Technical Drawing, Engineering Science, Woodwork, Building Construction, Metalwork\n  - Science: Chemistry, Physics\n  - General Art: Economics, Geography\n');
    // Check for Mathematics (Elective)
    const hasMathElective = electives.some((e: any) => e.subject.trim().toLowerCase() === 'mathematics (elective)');
    // Check for any two from grouped options
    let groupSubjects = [
      { group: 'Technical', subjects: ['technical drawing', 'engineering science', 'woodwork', 'building construction', 'metalwork'] },
      { group: 'Science', subjects: ['chemistry', 'physics'] },
      { group: 'General Art', subjects: ['economics', 'geography'] }
    ];
    let passedGroups: { group: string, subjects: string[] }[] = [];
    for (const g of groupSubjects) {
      const passed = electives.filter((e: any) => g.subjects.includes(e.subject.trim().toLowerCase()));
      if (passed.length > 0) {
        passedGroups.push({ group: g.group, subjects: passed.map((e: any) => `${e.subject} (${e.grade})`) });
      }
    }
    // Count total unique subjects passed from all groups (excluding Math Elective)
    let uniquePassed = new Set<string>();
    passedGroups.forEach(g => g.subjects.forEach(s => uniquePassed.add(s)));
    let electivesEligible = hasMathElective && uniquePassed.size >= 2;
    if (!hasMathElective) {
      details.push('Missing required elective: Mathematics (Elective)');
    }
    if (uniquePassed.size < 2) {
      details.push('Missing required electives: Any TWO (2) from Technical, Science, or General Art options.');
    }
    if (electivesEligible) {
      details.push(`You qualified using: Mathematics (Elective), and ${Array.from(uniquePassed).join(', ')}`);
    } else {
      details.push(`Your electives: ${electives.map((e: any) => `${e.subject} (${e.grade})`).join(', ')}`);
    }
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    return {
      eligible: electivesEligible && aggregateEligible,
      details
    };
  }
  // Custom logic for BSc Landscape Design and Management
  if (programName === 'BSC. LANDSCAPE DESIGN AND MANAGEMENT') {
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
    const hasEnglish = coreSubjects.includes('english language');
    const hasMath = coreSubjects.includes('mathematics');
    const hasScience = coreSubjects.includes('integrated science');
    let details: string[] = [];
    // Always include requirements explanation first
    if (customExplanations[programName]) {
      details.push(customExplanations[programName]);
    }
    // ...existing code...
    // Science group: Chemistry, (Physics or Mathematics (Elective) or Crop Husbandry), (Biology or General Agriculture)
    const hasChemistry = electives.some((e: any) => e.subject.trim().toLowerCase() === 'chemistry');
    const hasPhysMathCrop = electives.some((e: any) => ['physics', 'mathematics (elective)', 'crop husbandry'].includes(e.subject.trim().toLowerCase()));
    const hasBioOrAgri = electives.some((e: any) => ['biology', 'general agriculture'].includes(e.subject.trim().toLowerCase()));
    const scienceEligible = hasChemistry && hasPhysMathCrop && hasBioOrAgri;
    // ...existing code...
    const artsSubjects = ['mathematics (elective)', 'geography', 'economics', 'technical drawing', 'general knowledge in art'];
    const artsCount = electives.filter((e: any) => artsSubjects.includes(e.subject.trim().toLowerCase())).length;
    const artsEligible = artsCount >= 3;
    // ...existing code...
    const visualArtSubjects = ['general knowledge in art', 'graphic design', 'chemistry', 'picture making', 'painting', 'sculpture'];
    const visualArtCount = electives.filter((e: any) => visualArtSubjects.includes(e.subject.trim().toLowerCase())).length;
    const visualArtEligible = visualArtCount >= 3;
    let electivesEligible = false;
    let groupMet = '';
    let usedElectives: string[] = electives.map((e: any) => `${e.subject} (${e.grade})`);
    if (scienceEligible) {
      electivesEligible = true;
      groupMet = 'Science';
      if (!hasEnglish || !hasMath || !hasScience) {
        details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      }
      details.push(`You qualified using Science group electives: ${usedElectives.join(', ')}`);
    } else if (artsEligible) {
      electivesEligible = true;
      groupMet = 'General Arts';
      if (!hasEnglish || !hasMath || !hasScience) {
        details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      }
      details.push(`You qualified using General Arts group electives: ${usedElectives.join(', ')}`);
    } else if (visualArtEligible) {
      electivesEligible = true;
      groupMet = 'Visual Art';
      if (!hasEnglish || !hasMath || !hasScience) {
        details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      }
      details.push(`You qualified using Visual Art group electives: ${usedElectives.join(', ')}`);
    }
    if (!electivesEligible) {
      details.push('Missing required electives: Credit passes in THREE subjects from ONE group only:');
      details.push('i. Science: Chemistry, Physics or Mathematics (Elective) or Crop Husbandry, Biology or General Agriculture');
      details.push('ii. General Arts: Mathematics (Elective), Geography, Economics, Technical Drawing, General Knowledge in Art');
      details.push('iii. Visual Art: General Knowledge in Art, Graphic Design, Chemistry, Picture Making, Painting, Sculpture');
      details.push(`Your electives: ${usedElectives.join(', ')}`);
    }
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    return {
      eligible: electivesEligible && aggregateEligible && details.length > 0,
      details
    };
  }
  // Strict matching for BSc Natural Resource Management, Forest Resource Technology, Aquaculture and Water Resource Management
  if ([
    'BSC. NATURAL RESOURCE MANAGEMENT',
    'BSC. FOREST RESOURCE TECHNOLOGY',
    'BSC. AQUACULTURE AND WATER RESOURCE MANAGEMENT'
  ].includes(programName)) {
    // Use shared core eligibility
    const { coreEligible, details: coreDetails } = checkCustomCoreEligibility(combo);
    let details: string[] = [];
    // Always include requirements explanation first
    if (customExplanations[programName]) {
      details.push(customExplanations[programName]);
    }
    // ...existing code...
    let chem = false, physOrMath = false, bioOrAgri = false;
    for (const e of combo.electiveSubjects) {
      const subj = normalizeSubjectName(e.subject);
      if (subj.includes('chemistry')) chem = true;
      if (subj.includes('physics') || subj.includes('mathematics')) physOrMath = true;
      if (subj.includes('biology') || subj.includes('generalagriculture')) bioOrAgri = true;
    }
    let electivesEligible = chem && physOrMath && bioOrAgri;
    let usedElectives: string[] = combo.electiveSubjects.map((e: any) => `${e.subject} (${e.grade})`);
    if (!electivesEligible) {
      details.push('Missing required electives: Chemistry, Physics/Mathematics, Biology/General Agriculture');
      details.push(`Your electives: ${usedElectives.join(', ')}`);
    } else {
      details.push(`You qualified using electives: ${usedElectives.join(', ')}`);
    }
    details.push(...coreDetails);
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    return {
      eligible: coreEligible && electivesEligible && aggregateEligible && details.length > 0,
      details
    };
  }

    // Custom logic for BSc Agribusiness Management
    if (programName === 'BSC. AGRIBUSINESS MANAGEMENT') {
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
    const hasEnglish = coreSubjects.includes('english language');
    const hasMath = coreSubjects.includes('mathematics');
    const coreScience = combo.coreSubjects.find((s: any) => s.subject.trim().toLowerCase() === 'integrated science');
    const coreScienceGrade = coreScience ? gradeToNumber(coreScience.grade) : 10;
    let details: string[] = [];
    // Always include requirements explanation first
    if (customExplanations[programName]) {
      details.push(customExplanations[programName]);
    }
    // ...existing code...
    const hasChemistry = electives.some((e: any) => e.subject.trim().toLowerCase() === 'chemistry');
    const hasPhysicsOrMath = electives.some((e: any) => ['physics', 'mathematics (elective)'].includes(e.subject.trim().toLowerCase()));
    const hasBioOrAgri = electives.some((e: any) => ['biology', 'general agriculture'].includes(e.subject.trim().toLowerCase()));
    const scienceEligible = hasChemistry && hasPhysicsOrMath && hasBioOrAgri;
    const businessSubjects = ['economics', 'accounting', 'business management', 'business mathematics', 'costing', 'mathematics (elective)'];
    const businessCount = electives.filter((e: any) => businessSubjects.includes(e.subject.trim().toLowerCase())).length;
    const businessEligible = businessCount >= 3 && coreScienceGrade <= 3;
    const artsSubjects = ['economics', 'geography', 'mathematics (elective)'];
    const artsCount = electives.filter((e: any) => artsSubjects.includes(e.subject.trim().toLowerCase())).length;
    const artsEligible = artsCount >= 3 && coreScienceGrade <= 3;
    const hasChemAgri = electives.some((e: any) => e.subject.trim().toLowerCase() === 'chemistry');
    const hasPhysOrMathAgri = electives.some((e: any) => ['physics', 'mathematics (elective)'].includes(e.subject.trim().toLowerCase()));
    const hasBioOrAgriOrCropOrHort = electives.some((e: any) => ['biology', 'general agriculture', 'crop husbandry', 'horticulture'].includes(e.subject.trim().toLowerCase()));
    const agriEligible = hasChemAgri && hasPhysOrMathAgri && hasBioOrAgriOrCropOrHort;
    let electivesEligible = false;
    let groupMet = '';
    let usedElectives: string[] = electives.map((e: any) => `${e.subject} (${e.grade})`);
    if (scienceEligible) {
      electivesEligible = true;
      groupMet = 'Science';
      if (!hasEnglish || !hasMath || !coreScience) {
        details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      }
      details.push(`You qualified using Science group electives: ${usedElectives.join(', ')}`);
    } else if (businessEligible) {
      electivesEligible = true;
      groupMet = 'Business';
      if (!hasEnglish || !hasMath) {
        details.push('Missing required core subjects: English, Mathematics');
      }
      if (coreScienceGrade > 3) {
        details.push('For Business group, Integrated Science must be at least B3.');
      }
      details.push(`You qualified using Business group electives: ${usedElectives.join(', ')}`);
    } else if (artsEligible) {
      electivesEligible = true;
      groupMet = 'General Arts';
      if (!hasEnglish || !hasMath) {
        details.push('Missing required core subjects: English, Mathematics');
      }
      if (coreScienceGrade > 3) {
        details.push('For General Arts group, Integrated Science must be at least B3.');
      }
      details.push(`You qualified using General Arts group electives: ${usedElectives.join(', ')}`);
    } else if (agriEligible) {
      electivesEligible = true;
      groupMet = 'General Agriculture';
      if (!hasEnglish || !hasMath || !coreScience) {
        details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      }
      details.push(`You qualified using General Agriculture group electives: ${usedElectives.join(', ')}`);
    }
    if (!electivesEligible) {
      details.push('Missing required electives: Credit passes in THREE subjects from ONE group only:');
      details.push('i. Science: Chemistry, Physics or Mathematics (Elective), Biology or General Agriculture');
      details.push('ii. Business: Economics, Accounting, Business Management, Business Mathematics, Costing, Mathematics (Elective) [Integrated Science must be at least B3]');
      details.push('iii. General Arts: Economics, Geography, Mathematics (Elective) [Integrated Science must be at least B3]');
      details.push('iv. General Agriculture: Chemistry, Physics or Mathematics (Elective), Biology or General Agriculture or Crop Husbandry or Horticulture');
      details.push(`Your electives: ${usedElectives.join(', ')}`);
    }
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    return {
      eligible: electivesEligible && aggregateEligible && details.length > 0,
      details
    };
  }
  // Option-based logic for BSc Land Economy and BSc Real Estate
  if ([
    'BSC. LAND ECONOMY',
    'BSC. REAL ESTATE'
  ].includes(programName)) {
    const { coreEligible, details: coreDetails } = checkCustomCoreEligibility(combo);
    let details: string[] = [];
    // Always include requirements explanation first
    if (customExplanations[programName]) {
      details.push(customExplanations[programName]);
    }
    // ...existing code...
    const optionAExtra = [
      'accounting', 'business management', 'government', 'business mathematics', 'french',
      'literature in english', 'history', 'building construction', 'technical drawing', 'mathematics (elective)'
    ];
    const optionBOthers = [
      'elective mathematics', 'geography', 'accounting', 'business management', 'business mathematics',
      'government', 'french', 'building construction', 'technical drawing', 'general knowledge in art'
    ];
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    const hasEconomicsA = electives.some((e: any) => e.subject.trim().toLowerCase() === 'economics');
    const hasGeographyA = electives.some((e: any) => e.subject.trim().toLowerCase() === 'geography');
    const hasExtraA = electives.some((e: any) => optionAExtra.includes(e.subject.trim().toLowerCase()));
    let optionA = hasEconomicsA && hasGeographyA && hasExtraA;
    const hasEconomicsB = electives.some((e: any) => e.subject.trim().toLowerCase() === 'economics');
    const countBOthers = electives.filter((e: any) => optionBOthers.includes(e.subject.trim().toLowerCase())).length;
    let optionB = hasEconomicsB && countBOthers >= 2;
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    let usedElectives: string[] = electives.map((e: any) => `${e.subject} (${e.grade})`);
    if (coreEligible && aggregateEligible && (optionA || optionB)) {
      details.push('To be fully eligible for Land Economy or Real Estate:');
      details.push('Option 1: Pass Economics, Geography, and one of these: Accounting, Business Management, Government, Business Mathematics, French, Literature in English, History, Building Construction, Technical Drawing, Mathematics (Elective).');
      details.push('OR');
      details.push('Option 2: Pass Economics and any two of these: Elective Mathematics, Geography, Accounting, Business Management, Business Mathematics, Government, French, Building Construction, Technical Drawing, General Knowledge in Art.');
      details.push(`Your electives and grades: ${usedElectives.join(', ')}`);
      details.push(...coreDetails);
      return {
        eligible: true,
        details
      };
    }
    let missing: string[] = [];
    if (!optionA) {
      let missingA: string[] = [];
      if (!hasEconomicsA) missingA.push('Economics');
      if (!hasGeographyA) missingA.push('Geography');
      if (!hasExtraA) missingA.push('One of: Accounting, Business Management, Government, Business Mathematics, French, Literature in English, History, Building Construction, Technical Drawing, Mathematics (Elective)');
      if (missingA.length > 0) missing.push('For Option 1, you are missing: ' + missingA.join(', '));
    }
    if (!optionB) {
      let missingB: string[] = [];
      if (!hasEconomicsB) missingB.push('Economics');
      if (countBOthers < 2) missingB.push('Two of: Elective Mathematics, Geography, Accounting, Business Management, Business Mathematics, Government, French, Building Construction, Technical Drawing, General Knowledge in Art');
      if (missingB.length > 0) missing.push('For Option 2, you are missing: ' + missingB.join(', '));
    }
    details.push(...missing);
    details.push(`Your electives and grades: ${usedElectives.join(', ')}`);
    details.push(...coreDetails);
    return {
      eligible: false,
      details
    };
  }
  // Custom logic for BSC. ARCHITECTURE
  if (programName === 'BSC. ARCHITECTURE') {
    const { coreEligible, details: coreDetails } = checkCustomCoreEligibility(combo);
    let details: string[] = [];
    // Always include requirements explanation first
    if (customExplanations[programName]) {
      details.push(customExplanations[programName]);
    }
    // ...existing code...
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    const hasMathElective = electives.some((e: any) => e.subject.trim().toLowerCase() === 'mathematics (elective)');
    const hasTechDrawingOrEngScience = electives.some((e: any) => ['technical drawing', 'engineering science'].includes(e.subject.trim().toLowerCase()));
    const hasWoodworkOrMetalwork = electives.some((e: any) => ['woodwork', 'metalwork'].includes(e.subject.trim().toLowerCase()));
    const hasBuildingConstruction = electives.some((e: any) => e.subject.trim().toLowerCase() === 'building construction');
    const hasGeneralScience = ['biology', 'chemistry', 'physics'].some(subj => electives.some((e: any) => e.subject.trim().toLowerCase() === subj));
    const hasVisualArt = ['general knowledge in art', 'graphic design', 'picture making'].some(subj => electives.some((e: any) => e.subject.trim().toLowerCase() === subj));
    const hasGeneralArts = ['economics', 'geography', 'government', 'history'].some(subj => electives.some((e: any) => e.subject.trim().toLowerCase() === subj));
    let groupCount = 0;
    if (hasTechDrawingOrEngScience || hasWoodworkOrMetalwork || hasBuildingConstruction) groupCount++;
    if (hasGeneralScience) groupCount++;
    if (hasVisualArt) groupCount++;
    if (hasGeneralArts) groupCount++;
    let electivesEligible = hasMathElective && groupCount >= 2;
    let usedElectives: string[] = electives.map((e: any) => `${e.subject} (${e.grade})`);
    if (!hasMathElective) details.push('Missing required elective: Mathematics (Elective)');
    if (groupCount < 2) details.push('Missing required electives: Any TWO groups from Technical, General Science, Visual Art, General Arts (with at least one subject from each group)');
    if (electivesEligible) {
      details.push(`You qualified using electives: ${usedElectives.join(', ')}`);
    } else {
      details.push(`Your electives: ${usedElectives.join(', ')}`);
    }
    details.push(...coreDetails);
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    return {
      eligible: coreEligible && electivesEligible && aggregateEligible && details.length > 0,
      details
    };
  }
  // Add more custom logic programs here as needed
  return { eligible: false, details: ['No custom logic for this program.'] };
}
/**
 * Custom Eligibility Logic
 * -----------------------
 * Used for programs with unique, complex requirements.
 * Example: BSC. NATURAL RESOURCE MANAGEMENT, BSC. LAND ECONOMY, etc.
 * Logic is tailored for each program and not shared.
 *
 * How it works:
 * - Checks for specific core and elective subjects as required by each program.
 * - May have multiple options or combinations for eligibility.
 * - Returns detailed feedback on what is missing or met.
 */
export function checkCustomCoreEligibility(combo: any): { coreEligible: boolean, details: string[] } {
  const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
  const hasEnglish = coreSubjects.includes('english language');
  const hasMath = coreSubjects.includes('mathematics');
  const hasScience = coreSubjects.includes('integrated science');
  let coreEligible = hasEnglish && hasMath && hasScience;
  let details: string[] = [];
  if (!coreEligible) {
    details.push('Missing required core subjects: English, Mathematics, Integrated Science');
  }
  return { coreEligible, details };
}
