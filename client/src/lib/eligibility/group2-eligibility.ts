// Explanations for eligibility messages (for popups/modals)
export const group2Explanations: Record<string, string> = {
  'BSC. BIOCHEMISTRY':
    'To apply for Biochemistry:\n\nYou must have passed these elective subjects:\n  - Biology\n  - Chemistry\n  - Physics or Elective Mathematics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'FOOD SCIENCE AND TECHNOLOGY':
    'To apply for Food Science and Technology:\n\nYou must have passed these elective subjects:\n  - Biology\n  - Chemistry\n  - Physics or Elective Mathematics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'DOCTOR OF OPTOMETRY (OD)':
    'To apply for Doctor of Optometry (OD):\n\nYou must have passed these elective subjects:\n  - Biology\n  - Physics\n  - Chemistry or Elective Mathematics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nShortlisted applicants are expected to pass an interview.\n\nIf you meet all these, you are eligible!',
  'BSC. CHEMISTRY':
    'To apply for Chemistry:\n\nYou must have passed these elective subjects:\n  - Chemistry\n  - Physics\n  - Mathematics (Elective) or Biology\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BSC. PHYSICS':
    'To apply for Physics:\n\nYou must have passed these elective subjects:\n  - Physics\n  - Mathematics (Elective)\n  - Chemistry or Electronics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BSC. METEOROLOGY AND CLIMATE SCIENCE':
    'To apply for Meteorology and Climate Science:\n\nYou must have passed these elective subjects:\n  - Mathematics (Elective)\n  - Physics\n  - Chemistry or Electronics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BSC. MATHEMATICS':
    'To apply for Mathematics:\n\nYou must have passed these elective subjects:\n  - Mathematics (Elective)\n  - Physics\n  - Chemistry or Biology\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BSC. STATISTICS':
    'To apply for Statistics:\n\nYou must have passed these elective subjects:\n  - Mathematics (Elective)\n  - Any TWO other electives\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BSC. ACTUARIAL SCIENCE':
    'To apply for Actuarial Science:\n\nYou must have passed these elective subjects:\n  - Mathematics (Elective)\n  - Any TWO other electives\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BSC. COMPUTER SCIENCE':
    'To apply for Computer Science:\n\nYou must have passed these elective subjects:\n  - Mathematics (Elective)\n  - Physics\n  - Chemistry or Applied Electricity or Electronics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BA. HISTORY':
    'To apply for History:\n\nYou must have passed these elective subjects:\n  - History or Government (compulsory)\n  - One from: Economics, Geography, French, Ghanaian Language, Literature in English, Religious Studies\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nA pass in Social Studies (D7–E8) is needed for full eligibility.\n\nIf you meet all these, you are eligible!',
  'BA. POLITICAL STUDIES':
    'To apply for Political Studies:\n\nYou must have passed these elective subjects:\n  - History or Government (compulsory)\n  - One from: Economics, Geography, French, Ghanaian Language, Literature in English, Religious Studies\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nA pass in Social Studies (D7–E8) is needed for full eligibility.\n\nIf you meet all these, you are eligible!',
  'BA. GEOGRAPHY AND RURAL DEVELOPMENT':
    'To apply for Geography and Rural Development:\n\nYou must have passed these elective subjects:\n  - Geography (compulsory)\n  - Any TWO from: Economics, Government, French, Literature in English, Religious Studies, History, Mathematics (Elective), Akan\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BA. ENGLISH':
    'To apply for English:\n\nYou must have passed THREE electives from: Literature in English, French, History, Government, Economics, Geography, Akan, Religious Studies\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BA. FRENCH AND FRANCOPHONE STUDIES':
    'To apply for French and Francophone Studies:\n\nYou must have a good pass in French (A1–B3 compulsory)\n  - Any TWO from: History, Religious Studies, Economics, Geography, Government, Literature in English, Business Management, Ghanaian Language\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BA. AKAN LANGUAGE AND CULTURE':
    'To apply for Akan Language and Culture:\n\nYou must have passed THREE electives including:\n  - Akan (Asante Twi, Fante, Akuapem Twi) (compulsory)\n  - Any TWO from: History, Geography, Literature in English, French, Economics, Religious Studies, Government, Business Management\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BA. SOCIOLOGY':
    'To apply for Sociology:\n\nYou must have passed THREE electives from: History, Geography, Literature in English, French, Ghanaian Language, Government, Business Management, Mathematics (Elective), Economics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!',
  'BA. SOCIAL WORK':
    'To apply for Social Work:\n\nYou must have passed THREE electives from: History, Geography, Literature in English, French, Ghanaian Language, Government, Business Management, Mathematics (Elective), Economics\n\nYou must also have credit passes in English Language, Mathematics, and Integrated Science.\n\nIf you meet all these, you are eligible!'
};
// group2-eligibility.ts
// Group 2 eligibility logic for KNUST programs
// Add your Group 2 requirements and logic here

export type Group2EligibilityResult = { eligible: boolean, details: string[] };

const group2Programs: Record<string, { requiredElectives: string[] }> = {
  'BSC. BIOCHEMISTRY': {
    requiredElectives: ['biology', 'chemistry', 'physics|mathematics (elective)']
  },
  'FOOD SCIENCE AND TECHNOLOGY': {
    requiredElectives: ['biology', 'chemistry', 'physics|mathematics (elective)']
  },
  'DOCTOR OF OPTOMETRY (OD)': {
    requiredElectives: ['biology', 'physics', 'chemistry|mathematics (elective)']
  },
  'BSC. CHEMISTRY': {
    requiredElectives: ['chemistry', 'physics', 'mathematics (elective)|biology']
  },
  'BSC. PHYSICS': {
    requiredElectives: ['physics', 'mathematics (elective)', 'chemistry|electronics']
  },
  'BSC. METEOROLOGY AND CLIMATE SCIENCE': {
    requiredElectives: ['mathematics (elective)', 'physics', 'chemistry|electronics']
  },
  'BSC. MATHEMATICS': {
    requiredElectives: ['mathematics (elective)', 'physics', 'chemistry|biology']
  },
  'BSC. STATISTICS': {
    requiredElectives: ['mathematics (elective)', 'any2']
  },
  'BSC. ACTUARIAL SCIENCE': {
    requiredElectives: ['mathematics (elective)', 'any2']
  },
  'BSC. COMPUTER SCIENCE': {
    requiredElectives: ['mathematics (elective)', 'physics', 'chemistry|applied electricity|electronics']
  },
  'BA. HISTORY': {
    requiredElectives: ['history|government', 'economics|geography|french|ghanaian language|literature in english|religious studies']
  },
  'BA. POLITICAL STUDIES': {
    requiredElectives: ['history|government', 'economics|geography|french|ghanaian language|literature in english|religious studies']
  },
  'BA. GEOGRAPHY AND RURAL DEVELOPMENT': {
    requiredElectives: ['geography', 'economics|government|french|literature in english|religious studies|history|mathematics (elective)|akan', 'economics|government|french|literature in english|religious studies|history|mathematics (elective)|akan']
  },
  'BA. ENGLISH': {
    requiredElectives: ['literature in english|french|history|government|economics|geography|akan|religious studies', 'literature in english|french|history|government|economics|geography|akan|religious studies', 'literature in english|french|history|government|economics|geography|akan|religious studies']
  },
  'BA. FRENCH AND FRANCOPHONE STUDIES': {
    requiredElectives: ['french', 'history|religious studies|economics|geography|government|literature in english|business management|ghanaian language', 'history|religious studies|economics|geography|government|literature in english|business management|ghanaian language']
  },
  'BA. AKAN LANGUAGE AND CULTURE': {
    requiredElectives: ['akan', 'history|geography|literature in english|french|economics|religious studies|government|business management', 'history|geography|literature in english|french|economics|religious studies|government|business management']
  },
  'BA. SOCIOLOGY': {
    requiredElectives: ['history|geography|literature in english|french|ghanaian language|government|business management|mathematics (elective)|economics', 'history|geography|literature in english|french|ghanaian language|government|business management|mathematics (elective)|economics', 'history|geography|literature in english|french|ghanaian language|government|business management|mathematics (elective)|economics']
  },
  'BA. SOCIAL WORK': {
    requiredElectives: ['history|geography|literature in english|french|ghanaian language|government|business management|mathematics (elective)|economics', 'history|geography|literature in english|french|ghanaian language|government|business management|mathematics (elective)|economics', 'history|geography|literature in english|french|ghanaian language|government|business management|mathematics (elective)|economics']
  }
  // Add more programs here as needed
};

export function checkGroup2Eligibility(combo: any, requirement: any, programName: string): Group2EligibilityResult {
  // Core: English, Mathematics, Integrated Science
  const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
  const hasEnglish = coreSubjects.includes('english language');
  const hasMath = coreSubjects.includes('mathematics');
  const hasScience = coreSubjects.includes('integrated science');
  let coreEligible = hasEnglish && hasMath && hasScience;
  let details: string[] = [];
  if (!coreEligible) {
    details.push('Missing required core subjects: English, Mathematics, Integrated Science');
  }

  // Elective logic
  const electives = combo.electiveSubjects.filter((e: any) => e.grade && ['a1','b2','b3','c4','c5','c6'].includes(e.grade.trim().toLowerCase()));
  const electiveSubjects = electives.map((e: any) => e.subject.trim().toLowerCase());

  const program = group2Programs[programName.toUpperCase()];
  let electivesEligible = false;
  let borderlineHint = '';
  if (program) {
    details.push('You must have passed these elective subjects:');
    // Custom logic for Social Sciences
    if (programName.toUpperCase() === 'BA. HISTORY' || programName.toUpperCase() === 'BA. POLITICAL STUDIES') {
      const hasCompulsory = electiveSubjects.includes('history') || electiveSubjects.includes('government');
      const artsList = ['economics','geography','french','ghanaian language','literature in english','religious studies'];
      const hasOneFromList = artsList.some(subj => electiveSubjects.includes(subj));
      if (hasCompulsory && hasOneFromList) {
        electivesEligible = true;
        details.push('  - History or Government (✓)');
        details.push('  - One from: Economics, Geography, French, Ghanaian Language, Literature in English, Religious Studies (✓)');
        details.push('A pass in Social Studies (D7–E8) is needed for full eligibility.');
      } else if (hasCompulsory) {
        electivesEligible = true;
        details.push('  - History or Government (✓)');
        details.push('  - One from: Economics, Geography, French, Ghanaian Language, Literature in English, Religious Studies (You missing all)');
        details.push('  To be fully eligible, you need an additional pass in a General Arts elective and a pass in Social Studies (D7–E8).');
      } else {
        electivesEligible = false;
        details.push('  - History or Government (missing)');
        details.push('  - One from: Economics, Geography, French, Ghanaian Language, Literature in English, Religious Studies (You missing all)');
      }
    } else if (programName.toUpperCase() === 'BA. GEOGRAPHY AND RURAL DEVELOPMENT') {
      const hasGeography = electiveSubjects.includes('geography');
      const artsList = ['economics','government','french','literature in english','religious studies','history','mathematics (elective)','akan'];
      const countArts = artsList.filter(subj => electiveSubjects.includes(subj)).length;
      if (hasGeography && countArts >= 2) {
        electivesEligible = true;
        details.push('  - Geography (✓)');
        details.push('  - Any TWO from: Economics, Government, French, Literature in English, Religious Studies, History, Mathematics (Elective), Akan (✓)');
      } else if (hasGeography) {
        electivesEligible = true;
        details.push('  - Geography (✓)');
        details.push('  - Any TWO from: Economics, Government, French, Literature in English, Religious Studies, History, Mathematics (Elective), Akan (You missing all)');
        details.push('  Another Option: To be fully eligible, you need two passes in General Arts electives.');
      } else {
        electivesEligible = false;
        details.push('  - Geography (missing)');
        details.push('  - Any TWO from: Economics, Government, French, Literature in English, Religious Studies, History, Mathematics (Elective), Akan (You missing all)');
      }
    } else if (programName.toUpperCase() === 'BA. ENGLISH') {
      const artsList = ['literature in english','french','history','government','economics','geography','akan','religious studies'];
      const countArts = artsList.filter(subj => electiveSubjects.includes(subj)).length;
      if (countArts >= 3) {
        electivesEligible = true;
        details.push('  - THREE from: Literature in English, French, History, Government, Economics, Geography, Akan, Religious Studies (✓)');
      } else {
        electivesEligible = true;
        details.push('  - THREE from: Literature in English, French, History, Government, Economics, Geography, Akan, Religious Studies (You missing all)');
        details.push('  Another option is: To be fully eligible, you need three passes in General Arts electives.');
      }
    } else if (programName.toUpperCase() === 'BA. FRENCH AND FRANCOPHONE STUDIES') {
      const hasFrenchGood = electives.some((e: any) => e.subject.trim().toLowerCase() === 'french' && ['a1','b2','b3'].includes(e.grade.trim().toLowerCase()));
      const artsList = ['history','religious studies','economics','geography','government','literature in english','business management','ghanaian language'];
      const countArts = artsList.filter(subj => electiveSubjects.includes(subj)).length;
      if (hasFrenchGood && countArts >= 2) {
        electivesEligible = true;
        details.push('  - French (A1–B3) (✓)');
        details.push('  - Any TWO from: History, Religious Studies, Economics, Geography, Government, Literature in English, Business Management, Ghanaian Language (✓)');
      } else if (hasFrenchGood) {
        electivesEligible = true;
        details.push('  - French (A1–B3) (✓)');
        details.push('  - Any TWO from: History, Religious Studies, Economics, Geography, Government, Literature in English, Business Management, Ghanaian Language (You missing all)');
        details.push('  Another option is: To be fully eligible, you need two passes in General Arts electives.');
      } else {
        electivesEligible = false;
        details.push('  - French (A1–B3) (missing)');
        details.push('  - Any TWO from: History, Religious Studies, Economics, Geography, Government, Literature in English, Business Management, Ghanaian Language (You missing all)');
      }
    } else if (programName.toUpperCase() === 'BA. AKAN LANGUAGE AND CULTURE') {
      const hasAkan = electiveSubjects.includes('akan');
      const artsList = ['history','geography','literature in english','french','economics','religious studies','government','business management'];
      const countArts = artsList.filter(subj => electiveSubjects.includes(subj)).length;
      if (hasAkan && countArts >= 2) {
        electivesEligible = true;
        details.push('  - Akan (✓)');
        details.push('  - Any TWO from: History, Geography, Literature in English, French, Economics, Religious Studies, Government, Business Management (✓)');
      } else if (hasAkan) {
        electivesEligible = true;
        details.push('  - Akan (✓)');
        details.push('  - Any TWO from: History, Geography, Literature in English, French, Economics, Religious Studies, Government, Business Management (You missing all)');
        details.push('  Another option is: To be fully eligible, you need two passes in General Arts electives.');
      } else {
        electivesEligible = false;
        details.push('  - Akan (missing)');
        details.push('  - Any TWO from: History, Geography, Literature in English, French, Economics, Religious Studies, Government, Business Management (You missing all)');
      }
        } else if (
      programName.toUpperCase() === 'BA. SOCIOLOGY' ||
      programName.toUpperCase() === 'BA. SOCIAL WORK'
    ) {
      const artsScienceList = [
        'history',
        'geography',
        'literature in english',
        'french',
        'ghanaian language',
        'government',
        'business management',
        'mathematics (elective)',
        'economics'
      ];
      const countArtsScience = artsScienceList.filter(subj => electiveSubjects.includes(subj)).length;
      if (coreEligible && countArtsScience >= 3) {
        electivesEligible = true;
        details.push('  - You passed THREE from: History, Geography, Literature in English, French, Ghanaian Language, Government, Business Management, Mathematics (Elective), Economics (✓)');
        // No hint message here!
      } else if (coreEligible && countArtsScience < 3) {
        electivesEligible = true;
        details.push('  - THREE from: History, Geography, Literature in English, French, Ghanaian Language, Government, Business Management, Mathematics (Elective), Economics (You missing all)');
        details.push('  Another option is: To be fully eligible, you need three passes in General Arts electives or Science Electives.');
      } else {
        electivesEligible = false;
        details.push('  - THREE from: History, Geography, Literature in English, French, Ghanaian Language, Government, Business Management, Mathematics (Elective), Economics (You missing all)');
      }
    } else if (program.requiredElectives.includes('any2')) {
      // Special logic for Statistics and Actuarial Science
      const hasMathElective = electiveSubjects.includes('mathematics (elective)');
      const otherElectives = electiveSubjects.filter((s: string) => s !== 'mathematics (elective)');
      electivesEligible = hasMathElective && otherElectives.length >= 2;
      if (!hasMathElective) details.push('  - Mathematics (Elective) (missing)'); else details.push('  - Mathematics (Elective');
      details.push('  - Any TWO other electives');
      if (!electivesEligible) details.push('You must have passed Mathematics (Elective) and any TWO other electives to be eligible.');
    } else {
      // General logic for other programs
      let allPresent = true;
      for (const req of program.requiredElectives) {
        if (req.includes('|')) {
          // Accept any of the options
          const options = req.split('|');
          const found = options.some(opt => electiveSubjects.includes(opt));
          details.push(`  - ${options.join(' or ')}${found ? '' : ' (missing)'}`);
          if (!found) allPresent = false;
        } else {
          const found = electiveSubjects.includes(req);
          details.push(`  - ${req.charAt(0).toUpperCase() + req.slice(1)}${found ? '' : ' (missing)'}`);
          if (!found) allPresent = false;
        }
      }
      electivesEligible = allPresent;
      if (!electivesEligible) details.push('You must have passed all the above electives to be eligible.');
    }
  } else {
    details.push('Program not found in Group 2 logic.');
  }

  // Aggregate check (optional, can add requirement.aggregatePoints logic)
  let aggregateEligible = true;

  return {
    eligible: coreEligible && electivesEligible && aggregateEligible,
    details
  };
}
