// Default eligibility logic for KNUST programs
import { gradeToNumber, normalizeSubjectName } from '../offline-eligibility-engine';

export function checkDefaultEligibility(combo: any, requirement: any, programName?: string) {
  // BSc Ceramic Technology
  if (programName && programName.trim().toUpperCase() === 'BSC. CERAMIC TECHNOLOGY') {
    const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
    const hasEnglish = coreSubjects.includes('english language');
    const hasMath = coreSubjects.includes('mathematics');
    const hasScience = coreSubjects.includes('integrated science');
    let coreEligible = hasEnglish && hasMath && hasScience;
    let coreDetails: string[] = [];
    if (!coreEligible) {
      coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
    }
    // Electives: Check all groups for 3 passes (C6 or better)
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    let groupQualified = '';
    // Visual Arts group
    const hasCeramics = electives.some((e: any) => e.subject.trim().toLowerCase() === 'ceramics');
    const hasGKA = electives.some((e: any) => e.subject.trim().toLowerCase() === 'general knowledge in art');
    const hasChemMathPhys = electives.some((e: any) => ['chemistry', 'mathematics (elective)', 'physics'].includes(e.subject.trim().toLowerCase()));
    if (hasCeramics && hasGKA && hasChemMathPhys) {
      groupQualified = 'Visual Arts';
    }
    // Science group
    const hasMathElective = electives.some((e: any) => e.subject.trim().toLowerCase() === 'mathematics (elective)');
    const hasChemistry = electives.some((e: any) => e.subject.trim().toLowerCase() === 'chemistry');
    const hasPhysOrBio = electives.some((e: any) => ['physics', 'biology'].includes(e.subject.trim().toLowerCase()));
    if (hasMathElective && hasChemistry && hasPhysOrBio) {
      groupQualified = 'Science';
    }
    // Technical group
    const technicalSubjects = ['technical drawing', 'building construction', 'applied electricity', 'auto mechanics', 'electronics', 'physics'];
    const techCount = electives.filter((e: any) => technicalSubjects.includes(e.subject.trim().toLowerCase())).length;
    if (techCount >= 3) {
      groupQualified = 'Technical';
    }
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    if (coreEligible && aggregateEligible && groupQualified) {
      return {
        eligible: true,
        details: [
          `You meet all CORE requirements for this program!`,
          `Qualified via group: ${groupQualified}`,
          electives.map((e: any) => `${e.subject} (${e.grade})`).join(', ')
        ]
      };
    } else {
      let details: string[] = [];
      if (!coreEligible) details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      if (!groupQualified) details.push('You do not qualify via any elective group.');
      return {
        eligible: false,
        details
      };
    }
  }
  // BFA. FINE ART & CURATORIAL PRACTICE
  if (programName && programName.trim().toUpperCase() === 'BFA. FINE ART & CURATORIAL PRACTICE') {
    const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
    const hasEnglish = coreSubjects.includes('english language');
    const hasMath = coreSubjects.includes('mathematics');
    const hasScience = coreSubjects.includes('integrated science');
    let coreEligible = hasEnglish && hasMath && hasScience;
    let coreDetails: string[] = [];
    if (!coreEligible) {
      coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
    }
    // Electives: Must have General Knowledge in Art
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    const hasGKA = electives.some((e: any) => e.subject.trim().toLowerCase() === 'general knowledge in art');
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    if (coreEligible && aggregateEligible && hasGKA) {
      // Group electives for feedback
      const groups = {
        'Visual Art': ['graphic design', 'picture making', 'sculpture', 'painting', 'textiles', 'ceramics', 'leatherwork', 'photography'],
        'Home Economics': ['management in living', 'food and nutrition', 'clothing and textiles', 'general knowledge in art'],
        'Technical': ['technical drawing', 'building construction', 'woodwork', 'metalwork', 'electronics', 'auto mechanics', 'applied electricity'],
        'Science': ['biology', 'chemistry', 'physics', 'mathematics (elective)'],
        'General Arts': ['literature in english', 'government', 'history', 'geography', 'economics', 'french', 'christian religious studies', 'islamic religious studies'],
        'Business': ['business management', 'financial accounting', 'cost accounting', 'economics', 'principles of costing', 'office practice', 'typewriting']
      };
      let groupFeedback: string[] = [];
      for (const [group, subjects] of Object.entries(groups)) {
        const matched = electives.filter((e: any) => subjects.includes(e.subject.trim().toLowerCase()) && e.subject.trim().toLowerCase() !== 'general knowledge in art');
        if (matched.length > 0) {
          groupFeedback.push(`${group}: ${matched.map((e: any) => `${e.subject} (${e.grade})`).join(', ')}`);
        }
      }
      return {
        eligible: true,
        details: [
          'You have General Knowledge in Art, which is required.',
          'Check which other electives you have under each group:',
          ...groupFeedback,
          'Aggregate:', `${combo.aggregate}/${requirement.aggregatePoints}`
        ]
      };
    } else {
      let details: string[] = [];
      if (!coreEligible) details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      if (!hasGKA) details.push('General Knowledge in Art is required as an elective.');
      return {
        eligible: false,
        details
      };
    }
  }

  // BA. COMMUNICATION DESIGN (GRAPHIC DESIGN)
  if (programName && programName.trim().toUpperCase() === 'BA. COMMUNICATION DESIGN (GRAPHIC DESIGN)') {
    const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
    const hasEnglish = coreSubjects.includes('english language');
    const hasMath = coreSubjects.includes('mathematics');
    const hasScience = coreSubjects.includes('integrated science');
    let coreEligible = hasEnglish && hasMath && hasScience;
    let coreDetails: string[] = [];
    if (!coreEligible) {
      coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
    }
    // Electives: Must have Graphic Design, General Knowledge in Art, ICT
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    const hasGraphicDesign = electives.some((e: any) => e.subject.trim().toLowerCase() === 'graphic design');
    const hasGKA = electives.some((e: any) => e.subject.trim().toLowerCase() === 'general knowledge in art');
    const hasICT = electives.some((e: any) => e.subject.trim().toLowerCase() === 'ict');
    // Find one other Visual Arts elective (excluding Leatherwork, Basketry, Bead making)
    const excluded = ['leatherwork', 'basketry', 'bead making'];
    const otherVisualArts = electives.filter((e: any) => {
      const subj = e.subject.trim().toLowerCase();
      return [
        'picture making', 'sculpture', 'painting', 'textiles', 'ceramics', 'photography', 'technical drawing'
      ].includes(subj) && !excluded.includes(subj);
    });
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    if (coreEligible && aggregateEligible && hasGraphicDesign && hasGKA && hasICT) {
      let detailsMsg = [];
      if (otherVisualArts.length > 0) {
        detailsMsg.push('You have the required electives. Confirm you are a Visual Arts student and check your other electives:');
        detailsMsg.push('Other Visual Arts electives:', otherVisualArts.map((e: any) => `${e.subject} (${e.grade})`).join(', '));
      } else {
        detailsMsg.push('You have the required electives, but do not have an additional Visual Arts elective (excluding Leatherwork, Basketry, Bead making).');
      }
      return {
        eligible: true,
        details: [
          'You have Graphic Design, General Knowledge in Art, and ICT, which are required.',
          ...detailsMsg,
          'Aggregate:', `${combo.aggregate}/${requirement.aggregatePoints}`
        ]
      };
    } else {
      let missing = [];
      if (!hasGraphicDesign) missing.push('Graphic Design');
      if (!hasGKA) missing.push('General Knowledge in Art');
      if (!hasICT) missing.push('ICT');
      let details: string[] = [];
      if (!coreEligible) details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      if (missing.length > 0) details.push('Missing electives: ' + missing.join(', '));
      return {
        eligible: false,
        details
      };
    }
  }

  // BA. PUBLISHING STUDIES
  if (programName && programName.trim().toUpperCase() === 'BA. PUBLISHING STUDIES') {
    const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
    const hasEnglish = coreSubjects.includes('english language');
    const hasMath = coreSubjects.includes('mathematics');
    const hasScience = coreSubjects.includes('integrated science');
    let coreEligible = hasEnglish && hasMath && hasScience;
    let coreDetails: string[] = [];
    if (!coreEligible) {
      coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
    }
    // Electives: Check all groups for 3 passes (C6 or better)
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    let groupQualified = '';
    // Visual Arts group
    const hasGKA = electives.some((e: any) => e.subject.trim().toLowerCase() === 'general knowledge in art');
    const hasPMorGD = electives.some((e: any) => ['picture making', 'graphic design'].includes(e.subject.trim().toLowerCase()));
    const hasTextilesSculptureLeatherwork = electives.some((e: any) => ['textiles', 'sculpture', 'leatherwork'].includes(e.subject.trim().toLowerCase()));
    if (hasGKA && hasPMorGD && hasTextilesSculptureLeatherwork) {
      groupQualified = 'Visual Arts';
    }
    // General Arts group
    const generalArtsSubjects = ['geography', 'economics', 'government', 'english language', 'history', 'religious studies', 'french', 'ghanaian languages'];
    const generalArtsCount = electives.filter((e: any) => generalArtsSubjects.includes(e.subject.trim().toLowerCase())).length;
    if (generalArtsCount >= 3) {
      groupQualified = 'General Arts';
    }
    // Business group
    const businessSubjects = ['economics', 'accounting', 'introduction to business management', 'business mathematics', 'principles of costing', 'mathematics (elective)'];
    const businessCount = electives.filter((e: any) => businessSubjects.includes(e.subject.trim().toLowerCase())).length;
    if (businessCount >= 3) {
      groupQualified = 'Business';
    }
    // Vocational/Home Economics group
    const hasMgmtLiving = electives.some((e: any) => e.subject.trim().toLowerCase() === 'management in living');
    const hasFoodOrClothing = electives.some((e: any) => ['food and nutrition', 'clothing and textiles'].includes(e.subject.trim().toLowerCase()));
    if (hasGKA && hasMgmtLiving && hasFoodOrClothing) {
      groupQualified = 'Vocational/Home Economics';
    }
    // Science group
    const hasBiology = electives.some((e: any) => e.subject.trim().toLowerCase() === 'biology');
    const hasChemistry = electives.some((e: any) => e.subject.trim().toLowerCase() === 'chemistry');
    const hasMathOrPhysics = electives.some((e: any) => ['mathematics (elective)', 'physics'].includes(e.subject.trim().toLowerCase()));
    if (hasBiology && hasChemistry && hasMathOrPhysics) {
      groupQualified = 'Science';
    }
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    if (coreEligible && aggregateEligible && groupQualified) {
      return {
        eligible: true,
        details: [
          'You meet all CORE requirements for this program!',
          `Qualified via group: ${groupQualified}`,
          electives.map((e: any) => `${e.subject} (${e.grade})`).join(', ')
        ]
      };
    } else {
      let details: string[] = [];
      if (!coreEligible) details.push('Missing required core subjects: English, Mathematics, Integrated Science');
      if (!groupQualified) details.push('You do not qualify via any elective group.');
      return {
        eligible: false,
        details
      };
    }
  }


  // Default logic for all other programs
  const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
  const hasEnglish = coreSubjects.includes('english language');
  const hasMath = coreSubjects.includes('mathematics');
  const hasScience = coreSubjects.includes('integrated science');
  let coreEligible = hasEnglish && hasMath && hasScience;
  let details: string[] = [];
  if (!coreEligible) {
    details.push('Missing required core subjects: English, Mathematics, Integrated Science');
  }
  let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
  if (coreEligible && aggregateEligible) {
    return {
      eligible: true,
      details: ['You meet all CORE requirements for this program!', `Aggregate: ✓ ${combo.aggregate}/${requirement.aggregatePoints}`]
    };
  } else {
    return {
      eligible: false,
      details
    };
  }
}
/**
 * Default Eligibility Logic
 * ------------------------
 * Used for programs not covered by group or custom logic.
 * Matches applicant’s subjects and grades against requirements in a generic way.
 *
 * How it works:
 * - Checks for required core subjects (English, Mathematics, Integrated Science).
 * - Matches electives and grades against the requirements file.
 * - Returns feedback on eligibility and missing requirements.
 */
// The duplicate function has been removed.
