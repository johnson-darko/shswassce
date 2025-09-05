import { localDataService } from './local-data-service';
import type { EligibilityResult, WassceeGrades, AdmissionTrack } from '@shared/schema';

// Grade value mapping for comparison
const gradeValues: Record<string, number> = {
  'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
};

// Convert grade string to numeric value for comparison
function gradeToNumber(grade: string): number {
  return gradeValues[grade] || 10; // 10 is worse than F9
}

// Check if student's grade meets the minimum requirement
function meetsGradeRequirement(studentGrade: string | undefined, requiredGrade: string): boolean {
  if (!studentGrade || studentGrade === '') return false;
  return gradeToNumber(studentGrade) <= gradeToNumber(requiredGrade);
}

// Calculate all possible aggregate combinations (best + alternatives)
function calculateAllAggregateCombinations(grades: WassceeGrades): Array<{
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
  const validCoreGrades = coreGradesData.filter(item => gradeValues[item.grade] <= 6);
  const validElectiveGrades = electiveGradesData.filter(item => gradeValues[item.grade] <= 6);

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
      const coreTotal = coreCombo.reduce((sum, item) => sum + gradeValues[item.grade], 0);
      const electiveTotal = electiveCombo.reduce((sum, item) => sum + gradeValues[item.grade], 0);
      const aggregate = coreTotal + electiveTotal;

      combinations.push({
        combination: `${coreCombo.map(c => c.subject).join(', ')} + ${electiveCombo.map(e => e.subject).join(', ')}`,
        aggregate,
        coreSubjects: coreCombo.map(c => ({ subject: c.subject, grade: c.grade })),
        electiveSubjects: electiveCombo.map(e => ({ subject: e.subject || '', grade: e.grade || '' })),
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
function calculateAggregatePoints(grades: WassceeGrades): number {
  const combinations = calculateAllAggregateCombinations(grades);
  return combinations.length > 0 ? combinations[0].aggregate : 999; // Return best aggregate or very high number
}

// Enhanced eligibility checker for complex requirements
function checkComplexRequirements(grades: WassceeGrades, requirement: any): {
  eligible: boolean;
  tracks: AdmissionTrack[];
  bestMatch?: string;
} {
  if (!requirement.admissionTracks) {
    return { eligible: false, tracks: [] };
  }

  const trackResults: AdmissionTrack[] = [];
  
  requirement.admissionTracks.forEach((track: any) => {
    track.electiveOptions.forEach((option: any) => {
      const matchDetails: string[] = [];
      let eligible = true;
      let borderline = false;

      // Check core subjects first
      Object.entries(requirement.coreSubjects).forEach(([subject, minGrade]) => {
        const studentGrade = grades[subject.toLowerCase() as keyof WassceeGrades];
        if (!meetsGradeRequirement(studentGrade, minGrade as string)) {
          eligible = false;
          matchDetails.push(`${subject}: Need ${minGrade}, got ${studentGrade || 'N/A'}`);
        } else {
          matchDetails.push(`${subject}: ✓ ${studentGrade}`);
        }
      });

      // Check elective requirements for this track
      const electiveMatches: Array<{subject: string, studentGrade: string, requiredGrade: string, meets: boolean}> = option.subjects.map((subject: string) => {
        const subjectKey = subject.toLowerCase().replace(/\s+/g, '').replace('elective', 'elective');
        let studentGrade: string | undefined;

        // Search through all 4 elective slots to find the matching subject
        for (let i = 1; i <= 4; i++) {
          const electiveSubjectKey = `elective${i}Subject` as keyof WassceeGrades;
          const electiveGradeKey = `elective${i}Grade` as keyof WassceeGrades;
          
          const electiveSubject = grades[electiveSubjectKey];
          const electiveGrade = grades[electiveGradeKey];
          
          if (electiveSubject === subject && electiveGrade) {
            studentGrade = electiveGrade;
            break;
          }
          
          // Also check normalized subject names
          const normalizedElectiveSubject = electiveSubject?.toLowerCase().replace(/\s+/g, '');
          if (normalizedElectiveSubject === subjectKey && electiveGrade) {
            studentGrade = electiveGrade;
            break;
          }
        }
        
        // Fallback to core subjects if not found in electives
        if (!studentGrade) {
          switch (subjectKey) {
            case 'integratedscience':
              studentGrade = grades.science;
              break;
            case 'socialstudies':
              studentGrade = grades.social;
              break;
            default:
              break;
          }
        }

        const requiredGrade = option.minGrades[subject] || 'C6';
        const meets = meetsGradeRequirement(studentGrade, requiredGrade);
        
        return {
          subject,
          studentGrade: studentGrade || 'N/A',
          requiredGrade,
          meets
        };
      });

      const electivesMetCount = electiveMatches.filter(match => match.meets).length;
      const requiredElectives = option.subjects.length;

      if (electivesMetCount < requiredElectives) {
        if (electivesMetCount >= Math.floor(requiredElectives * 0.7)) {
          borderline = true;
        } else {
          eligible = false;
        }
      }

      electiveMatches.forEach((match: {subject: string, studentGrade: string, requiredGrade: string, meets: boolean}) => {
        const status = match.meets ? '✓' : '✗';
        matchDetails.push(`${match.subject}: ${status} ${match.studentGrade} (need ${match.requiredGrade})`);
      });

      trackResults.push({
        name: track.name,
        description: track.description,
        electiveOptions: [option],
        additionalRequirements: option.additionalRules || [],
        status: eligible ? 'eligible' : (borderline ? 'borderline' : 'not_eligible'),
        matchDetails
      });
    });
  });

  const eligibleTracks = trackResults.filter(t => t.status === 'eligible');
  const borderlineTracks = trackResults.filter(t => t.status === 'borderline');
  const bestMatch = eligibleTracks[0]?.name || borderlineTracks[0]?.name;

  return {
    eligible: eligibleTracks.length > 0 || borderlineTracks.length > 0,
    tracks: trackResults,
    bestMatch
  };
}

// Main eligibility checking function
export async function checkEligibilityOffline(grades: WassceeGrades): Promise<EligibilityResult[]> {
  try {
    console.log('Checking eligibility offline with grades:', grades);
    
    const [programs, requirements] = await Promise.all([
      localDataService.getPrograms(),
      localDataService.getRequirements()
    ]);

    const results: EligibilityResult[] = [];
    const allAggregateCombinations = calculateAllAggregateCombinations(grades);
    const bestAggregatePoints = allAggregateCombinations.length > 0 ? allAggregateCombinations[0].aggregate : 999;

    for (const program of programs) {
      const programRequirements = requirements.filter(req => req.programId === program.id);
      
      if (programRequirements.length === 0) {
        continue; // Skip programs without requirements
      }

      const requirement = programRequirements[0]; // Take first requirement set
      let status: 'eligible' | 'borderline' | 'not_eligible' | 'multiple_tracks' = 'not_eligible';
      let message = '';
      let details: string[] = [];
      let recommendations: string[] = [];
      let admissionTracks: AdmissionTrack[] = [];
      let bestTrackMatch: string | undefined;
      let usedCombination: string | undefined;
      let combinationFromBest = false;

      // Check if program has complex admission tracks
      if (requirement.requirementComplexity === 'advanced' && requirement.admissionTracks) {
        const complexResult = checkComplexRequirements(grades, requirement);
        
        if (complexResult.eligible) {
          const eligibleTracks = complexResult.tracks.filter(t => t.status === 'eligible');
          const borderlineTracks = complexResult.tracks.filter(t => t.status === 'borderline');
          
          status = eligibleTracks.length > 0 ? 'multiple_tracks' : 'borderline';
          message = eligibleTracks.length > 0 
            ? `Eligible through ${eligibleTracks.length} admission track(s)`
            : `Borderline eligibility - consider improving grades`;
          
          admissionTracks = complexResult.tracks;
          bestTrackMatch = complexResult.bestMatch;
          details = [`Multiple admission pathways available`, `Best match: ${bestTrackMatch}`];
        } else {
          status = 'not_eligible';
          message = 'Does not meet requirements for any admission track';
          admissionTracks = complexResult.tracks;
          details = ['No suitable admission track found'];
        }
      } else {
        // Standard eligibility checking
        let eligible = true;
        let borderline = false;

        // Check core subjects
        Object.entries(requirement.coreSubjects).forEach(([subject, minGrade]) => {
          const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
          let studentGrade: string | undefined;

          // Map subject names to grade object keys
          switch (subjectKey) {
            case 'english':
              studentGrade = grades.english;
              break;
            case 'mathematics':
              studentGrade = grades.mathematics;
              break;
            case 'socialstudies':
              studentGrade = grades.social;
              break;
            case 'integratedscience':
              studentGrade = grades.science;
              break;
            default:
              studentGrade = grades[subjectKey as keyof WassceeGrades];
          }

          if (!meetsGradeRequirement(studentGrade, minGrade as string)) {
            if (gradeToNumber(studentGrade || 'F9') <= gradeToNumber(minGrade as string) + 1) {
              borderline = true;
              details.push(`${subject}: Close (${studentGrade || 'N/A'}, need ${minGrade})`);
            } else {
              eligible = false;
              details.push(`${subject}: Need ${minGrade}, got ${studentGrade || 'N/A'}`);
            }
          } else {
            details.push(`${subject}: ✓ ${studentGrade}`);
          }
        });

        // Check elective subjects
        if (requirement.electiveSubjects && requirement.electiveSubjects.length > 0) {
          let electivesMet = 0;
          
          requirement.electiveSubjects.forEach((elective: any) => {
            const subject = elective.subject.toLowerCase();
            let studentGrade: string | undefined;

            // Search through all 4 elective slots to find the matching subject
            for (let i = 1; i <= 4; i++) {
              const electiveSubjectKey = `elective${i}Subject` as keyof WassceeGrades;
              const electiveGradeKey = `elective${i}Grade` as keyof WassceeGrades;
              
              const electiveSubject = grades[electiveSubjectKey];
              const electiveGrade = grades[electiveGradeKey];
              
              if (electiveSubject && electiveGrade) {
                const normalizedElectiveSubject = electiveSubject.toLowerCase();
                
                if (subject.includes(normalizedElectiveSubject) || 
                    normalizedElectiveSubject.includes(elective.subject.toLowerCase()) ||
                    electiveSubject === elective.subject) {
                  studentGrade = electiveGrade;
                  break;
                }
              }
            }

            if (meetsGradeRequirement(studentGrade, elective.min_grade)) {
              electivesMet++;
              details.push(`${elective.subject}: ✓ ${studentGrade}`);
            } else {
              details.push(`${elective.subject}: Need ${elective.min_grade}, got ${studentGrade || 'N/A'}`);
            }
          });

          if (electivesMet < requirement.electiveSubjects.length) {
            if (electivesMet >= Math.floor(requirement.electiveSubjects.length * 0.7)) {
              borderline = true;
            } else {
              eligible = false;
            }
          }
        }

        // Check aggregate points using ALL combinations - find the best match
        if (requirement.aggregatePoints && allAggregateCombinations.length > 0) {
          let bestMatchingCombination = null;
          let aggregateStatus = 'not_eligible';
          
          for (const combo of allAggregateCombinations) {
            if (combo.aggregate <= requirement.aggregatePoints) {
              bestMatchingCombination = combo;
              aggregateStatus = 'eligible';
              break; // First one is the best since they're sorted
            } else if (combo.aggregate <= requirement.aggregatePoints + 3) {
              if (!bestMatchingCombination) {
                bestMatchingCombination = combo;
                aggregateStatus = 'borderline';
              }
            }
          }
          
          if (bestMatchingCombination) {
            usedCombination = bestMatchingCombination.combination;
            combinationFromBest = bestMatchingCombination.isBest;
            
            if (aggregateStatus === 'eligible') {
              details.push(`Aggregate: ✓ ${bestMatchingCombination.aggregate}/${requirement.aggregatePoints}`);
              if (!bestMatchingCombination.isBest) {
                details.push(`Using alternative combination: ${bestMatchingCombination.combination}`);
              }
            } else if (aggregateStatus === 'borderline') {
              borderline = true;
              details.push(`Aggregate: ${bestMatchingCombination.aggregate}/${requirement.aggregatePoints} (close)`);
              if (!bestMatchingCombination.isBest) {
                details.push(`Using alternative combination: ${bestMatchingCombination.combination}`);
              }
            }
          } else {
            eligible = false;
            const bestAvailable = allAggregateCombinations[0];
            details.push(`Aggregate: ${bestAvailable.aggregate}/${requirement.aggregatePoints} (too high)`);
          }
        }

        // Determine final status
        if (eligible) {
          status = 'eligible';
          message = 'You meet all requirements for this program!';
        } else if (borderline) {
          status = 'borderline';
          message = 'You\'re close to meeting the requirements';
          recommendations.push('Consider retaking subjects with borderline grades');
          recommendations.push('Apply anyway as requirements may be flexible');
        } else {
          status = 'not_eligible';
          message = 'You do not meet the current requirements';
          recommendations.push('Consider retaking key subjects to improve grades');
          recommendations.push('Look for foundation or bridging programs');
        }
      }

      // Calculate match score for sorting - prioritize best aggregate combinations
      let matchScore = 30; // Default for not_eligible
      
      if (status === 'eligible') {
        matchScore = combinationFromBest ? 100 : 90; // Best combo gets highest score
      } else if (status === 'multiple_tracks') {
        matchScore = 95;
      } else if (status === 'borderline') {
        matchScore = combinationFromBest ? 70 : 60; // Best combo gets higher score even for borderline
      }

      results.push({
        programId: program.id,
        programName: program.name,
        universityName: program.universityName,
        status,
        message,
        details,
        recommendations,
        matchScore,
        careerOutcomes: program.careerOutcomes,
        averageSalary: program.averageSalary,
        employmentRate: program.employmentRate,
        admissionTracks,
        bestTrackMatch,
        requirementComplexity: requirement.requirementComplexity,
        usedCombination,
        combinationFromBest
      });
    }

    // Sort results by match score (best matches first)
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    console.log(`Eligibility check completed: ${results.length} programs evaluated`);
    return results;
    
  } catch (error) {
    console.error('Error checking eligibility offline:', error);
    throw new Error('Failed to check eligibility offline');
  }
}