import { localDataService } from './local-data-service';

// Grade value mapping for comparison
export const gradeValues: Record<string, number> = {
  'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
};

// Convert grade string to numeric value for comparison
export function gradeToNumber(grade: string): number {
  return gradeValues[grade] || 10; // 10 is worse than F9
}

// Check if student's grade meets the minimum requirement
export function meetsGradeRequirement(studentGrade: string | undefined, requiredGrade: string): boolean {
  if (!studentGrade || studentGrade === '') return false;
  return gradeToNumber(studentGrade) <= gradeToNumber(requiredGrade);
}

// Calculate all possible aggregate combinations (best + alternatives)
export function calculateAllAggregateCombinations(grades: any): Array<{
  combination: string;
  aggregate: number;
  coreSubjects: Array<{subject: string, grade: string}>;
  electiveSubjects: Array<{subject: string, grade: string}>;
  isBest: boolean;
}> {
  const gradeValues: Record<string, number> = {
    'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
  };

  const coreGradesData = [
    { subject: 'English Language', grade: grades.english, key: 'english' },
    { subject: 'Mathematics', grade: grades.mathematics, key: 'mathematics' },
    { subject: 'Integrated Science', grade: grades.science, key: 'science' },
    { subject: 'Social Studies', grade: grades.social, key: 'social' }
  ].filter(item => item.grade !== '');

  const electiveGradesData = [
    { subject: grades.elective1Subject, grade: grades.elective1Grade },
    { subject: grades.elective2Subject, grade: grades.elective2Grade },
    { subject: grades.elective3Subject, grade: grades.elective3Grade },
    { subject: grades.elective4Subject, grade: grades.elective4Grade }
  ].filter(item => item.grade !== '' && item.subject !== '');

  // Must have at least 3 core and 3 elective subjects
  if (coreGradesData.length < 3 || electiveGradesData.length < 3) {
    return [];
  }

  // Filter subjects with C6 or better (grades 1-6)
  const validCoreGrades = coreGradesData.filter(item => item.grade !== undefined && gradeValues[item.grade] <= 6);
  const validElectiveGrades = electiveGradesData.filter(item => item.grade !== undefined && gradeValues[item.grade] <= 6);

  if (validCoreGrades.length < 3 || validElectiveGrades.length < 3) {
    return [];
  }

  // English and Mathematics are mandatory
  const englishCore = validCoreGrades.find(item => item.key === 'english');
  const mathCore = validCoreGrades.find(item => item.key === 'mathematics');
  
  if (!englishCore || !mathCore) {
    return [];
  }

  // Get other core subjects for combinations
  const otherCoreSubjects = validCoreGrades.filter(
    item => item.key !== 'english' && item.key !== 'mathematics'
  );

  // Generate all combinations of 3 electives
  const getCombinations = (arr: any[], size: number): any[][] => {
    if (size === 1) return arr.map(el => [el]);
    return arr.flatMap((el, i) => 
      getCombinations(arr.slice(i + 1), size - 1).map(combo => [el, ...combo])
    );
  };

  const electiveCombinations = getCombinations(validElectiveGrades, 3);
  const combinations: Array<{
    combination: string;
    aggregate: number;
    coreSubjects: Array<{subject: string, grade: string}>;
    electiveSubjects: Array<{subject: string, grade: string}>;
    isBest: boolean;
  }> = [];

  // Generate all valid combinations
  for (const thirdCore of otherCoreSubjects) {
    const coreCombo = [englishCore, mathCore, thirdCore];
    
    for (const electiveCombo of electiveCombinations) {
  const coreTotal = coreCombo.reduce((sum, item) => sum + gradeValues[item.grade ?? 'F9'], 0);
  const electiveTotal = electiveCombo.reduce((sum, item) => sum + gradeValues[item.grade ?? 'F9'], 0);
      const aggregate = coreTotal + electiveTotal;

      combinations.push({
        combination: `${coreCombo.map(c => c.subject).join(', ')} + ${electiveCombo.map(e => e.subject).join(', ')}`,
        aggregate,
  coreSubjects: coreCombo.map(c => ({ subject: c.subject, grade: c.grade ?? 'F9' })),
  electiveSubjects: electiveCombo.map(e => ({ subject: e.subject || '', grade: e.grade ?? 'F9' })),
        isBest: false
      });
    }
  }

  // Sort by aggregate (best first)
  combinations.sort((a, b) => a.aggregate - b.aggregate);
  
  // Mark the best combination
  if (combinations.length > 0) {
    combinations[0].isBest = true;
  }

  return combinations;
}

// Calculate aggregate points from grades (lower is better in Ghana system) - legacy function
function calculateAggregatePoints(grades: any): number {
  const combinations = calculateAllAggregateCombinations(grades);
  return combinations.length > 0 ? combinations[0].aggregate : 999; // Return best aggregate or very high number
}

// Enhanced eligibility checker for complex requirements
function checkComplexRequirements(grades: any, requirement: any): {
  eligible: boolean;
  tracks: any[];
  bestMatch?: string;
  usedElectives?: { subject: string, grade: string }[];
} {
  if (!requirement.admissionTracks) {
    return { eligible: false, tracks: [] };
  }

  const trackResults: any[] = [];
  let usedElectives: { subject: string, grade: string }[] = [];
  let foundTrack = false;
  let bestTrackName = '';
  let bestTrackMatches: { subject: string, grade: string }[] = [];
  let bestTrackScore = -1;

  requirement.admissionTracks.forEach((track: any) => {
    track.electiveOptions.forEach((option: any) => {
      const matchDetails: string[] = [];
      let eligible = true;
      let borderline = false;
      let matchedElectives: { subject: string, grade: string }[] = [];
      let matchScore = 0;

      // Check core subjects first
      Object.entries(requirement.coreSubjects).forEach(([subject, minGrade]) => {
        const studentGrade = grades[subject.toLowerCase() as keyof typeof grades];
        if (!meetsGradeRequirement(studentGrade, minGrade as string)) {
          eligible = false;
          matchDetails.push(`${subject}: Need ${minGrade}, got ${studentGrade || 'N/A'}`);
        } else {
          matchDetails.push(`${subject}: ✓ ${studentGrade}`);
        }
      });

      // Check elective requirements for this track
      option.subjects.forEach((subject: string) => {
        const subjectKey = subject.toLowerCase().replace(/\s+/g, '').replace('elective', 'elective');
        let studentGrade: string | undefined;
        let found = false;
        // Search through all 4 elective slots to find the matching subject
        for (let i = 1; i <= 4; i++) {
          const electiveSubjectKey = `elective${i}Subject` as keyof typeof grades;
          const electiveGradeKey = `elective${i}Grade` as keyof typeof grades;
          const electiveSubject = grades[electiveSubjectKey];
          const electiveGrade = grades[electiveGradeKey];
          if (
            electiveSubject &&
            normalizeSubjectName(electiveSubject) === normalizeSubjectName(subject) &&
            electiveGrade
          ) {
            studentGrade = electiveGrade;
            matchedElectives.push({ subject: electiveSubject, grade: electiveGrade });
            found = true;
            break;
          }
        }
        // Fallback to core subjects if not found in electives
        if (!found) {
          switch (subjectKey) {
            case 'integratedscience':
              if (grades.science && meetsGradeRequirement(grades.science, option.minGrades[subject] || 'C6')) {
                studentGrade = grades.science;
                matchedElectives.push({ subject: 'Integrated Science', grade: grades.science });
                found = true;
              }
              break;
            case 'socialstudies':
              if (grades.social && meetsGradeRequirement(grades.social, option.minGrades[subject] || 'C6')) {
                studentGrade = grades.social;
                matchedElectives.push({ subject: 'Social Studies', grade: grades.social });
                found = true;
              }
              break;
            default:
              break;
          }
        }
        const requiredGrade = option.minGrades[subject] || 'C6';
        const meets = meetsGradeRequirement(studentGrade, requiredGrade);
        if (meets) matchScore++;
      });

      if (matchScore > bestTrackScore) {
        bestTrackScore = matchScore;
        bestTrackName = track.name;
        bestTrackMatches = matchedElectives;
      }

      trackResults.push({
        name: track.name,
        description: track.description,
        electiveOptions: [option],
        additionalRequirements: option.additionalRules || [],
        status: eligible ? 'eligible' : (borderline ? 'borderline' : 'not_eligible'),
        matchDetails
      });

      // If eligible, save the electives used for this track
      if (eligible && !foundTrack) {
        usedElectives = matchedElectives;
        foundTrack = true;
      }
    });
  });

  return {
    eligible: bestTrackScore === requirement.admissionTracks[0].electiveOptions[0].subjects.length,
    tracks: trackResults,
    bestMatch: bestTrackName,
    usedElectives: bestTrackMatches
  };
}

// Helper to normalize subject names for matching
export function normalizeSubjectName(subject: string): string {
  return subject.toLowerCase().replace(/\s+/g, '').replace(/\(elective\)/g, '').replace(/elective/g, '').replace(/[^a-z0-9]/g, '');
}

// Enhanced core subject logic for new requirements structure
function checkCoreSubjectsFlexible(grades: any, coreReq: any): { eligible: boolean, details: string[], usedBestOf?: string, bestOfGrade?: string } {
  let eligible = true;
  let details: string[] = [];
  let usedBestOf = '';
  let bestOfGrade = '';

  // Compulsory subjects
  if (coreReq.compulsory) {
    for (const subject of coreReq.compulsory) {
      const key = subject.toLowerCase().replace(/\s+/g, '');
      const studentGrade = grades[key as keyof typeof grades];
      if (!meetsGradeRequirement(studentGrade, coreReq.minGrade || 'C6')) {
        eligible = false;
        details.push(`${subject}: Need ${coreReq.minGrade || 'C6'}, got ${studentGrade || 'N/A'}`);
      } else {
        details.push(`${subject}: ✓ ${studentGrade}`);
      }
    }
  }

  // Alternatives (one_of)
  if (coreReq.alternatives) {
    for (const alt of coreReq.alternatives) {
      if (alt.type === 'one_of') {
        let found = false;
        for (const subject of alt.subjects) {
          const key = subject.toLowerCase().replace(/\s+/g, '');
          const studentGrade = grades[key as keyof typeof grades];
          if (meetsGradeRequirement(studentGrade, alt.minGrade)) {
            found = true;
            details.push(`${subject}: ✓ ${studentGrade}`);
            break;
          }
        }
        if (!found) {
          eligible = false;
          details.push(`Need at least one of [${alt.subjects.join(', ')}] with ${alt.minGrade}`);
        }
      }
    }
  }

  // bestOf
  if (coreReq.bestOf) {
    const gradesArr = coreReq.bestOf.map((subject: string) => {
      const key = subject.toLowerCase().replace(/\s+/g, '');
      return { subject, grade: grades[key as keyof typeof grades] ?? 'F9' };
    });
    const best = gradesArr.reduce((prev: { subject: string, grade: string }, curr: { subject: string, grade: string }) => {
      if (!prev.grade) return curr;
      if (!curr.grade) return prev;
      return gradeToNumber(curr.grade) < gradeToNumber(prev.grade) ? curr : prev;
    }, { subject: '', grade: '' });
    if (best.grade && gradeToNumber(best.grade) <= 6) {
      details.push(`Best of ${coreReq.bestOf.join(' or ')}: ✓ ${best.subject} (${best.grade})`);
      usedBestOf = best.subject;
      bestOfGrade = best.grade;
    } else {
      eligible = false;
      details.push(`Need at least one good grade in ${coreReq.bestOf.join(' or ')}`);
    }
  }

  return { eligible, details, usedBestOf, bestOfGrade };
}

// Main eligibility checking function
export async function checkEligibilityOffline(grades: any): Promise<any[]> {
  try {
    console.log('Checking eligibility offline with grades:', grades);
    const [programs, requirements] = await Promise.all([
      localDataService.getPrograms(),
      localDataService.getRequirements()
    ]);
    let results: any[] = [];
    // --- Per-school routing block ---
    // Group programs by university
    const programsByUniversity: Record<string, any[]> = {};
    for (const program of programs) {
      if (!programsByUniversity[program.universityName]) {
        programsByUniversity[program.universityName] = [];
      }
      programsByUniversity[program.universityName].push(program);
    }
    // Group requirements by university
    const requirementsByUniversity: Record<string, any[]> = {};
    for (const req of requirements) {
      if (!requirementsByUniversity[req.universityName]) {
        requirementsByUniversity[req.universityName] = [];
      }
      requirementsByUniversity[req.universityName].push(req);
    }
    // Route to per-school logic
    for (const universityName of Object.keys(programsByUniversity)) {
      const uniPrograms = programsByUniversity[universityName];
      const uniRequirements = requirementsByUniversity[universityName] || [];
      switch (universityName) {
        case 'University of Ghana': {
          // @ts-ignore
          const { checkEligibilityUG } = await import('./eligibility/eligibility-ug');
          results = results.concat(checkEligibilityUG(grades, uniPrograms, uniRequirements));
          break;
        }
        case 'Kwame Nkrumah University of Science and Technology': {
          // @ts-ignore
          const { checkEligibilityKNUST } = await import('./eligibility/eligibility-knust');
          results = results.concat(checkEligibilityKNUST(grades, uniPrograms, uniRequirements));
          break;
        }
        case 'University of Cape Coast': {
          // @ts-ignore
          const { checkEligibilityUCC } = await import('./eligibility/eligibility-ucc');
          results = results.concat(checkEligibilityUCC(grades, uniPrograms, uniRequirements));
          break;
        }
        case 'Ashesi University': {
          // @ts-ignore
          const { checkEligibilityAshesi } = await import('./eligibility/eligibility-ashesi');
          results = results.concat(checkEligibilityAshesi(grades, uniPrograms, uniRequirements));
          break;
        }
        case 'University for Development Studies': {
          // @ts-ignore
          const { checkEligibilityUDS } = await import('./eligibility/eligibility-uds');
          results = results.concat(checkEligibilityUDS(grades, uniPrograms, uniRequirements));
          break;
        }
        default:
          // fallback to default logic (could be global)
          // ...existing code for default...
          break;
      }
    }
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    console.log(`Eligibility check completed: ${results.length} programs evaluated`);
    return results;
    // --- Old logic below, commented for migration ---
    /*
    const allAggregateCombinations = calculateAllAggregateCombinations(grades);
    const bestAggregatePoints = allAggregateCombinations.length > 0 ? allAggregateCombinations[0].aggregate : 999;
    for (const program of programs) {
      const programRequirements = requirements.filter(req => req.programId === program.id);
      if (programRequirements.length === 0) {
        continue; // Skip programs without requirements
      }
      let bestOutcome = null;
      for (const requirement of programRequirements) {
          // ...existing code...
      }
      if (bestOutcome) results.push(bestOutcome);
    }
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    console.log(`Eligibility check completed: ${results.length} programs evaluated`);
    return results;
    */
  } catch (error) {
    console.error('Error checking eligibility offline:', error);
    throw new Error('Failed to check eligibility offline');
  }
}