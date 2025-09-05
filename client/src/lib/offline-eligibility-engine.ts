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

// Calculate aggregate points from grades (lower is better in Ghana system)
function calculateAggregatePoints(grades: WassceeGrades): number {
  const coreSubjects = ['english', 'mathematics', 'social', 'science'];
  let total = 0;
  let validGrades = 0;

  coreSubjects.forEach(subject => {
    const grade = grades[subject as keyof WassceeGrades];
    if (grade && grade !== '') {
      total += gradeToNumber(grade);
      validGrades++;
    }
  });

  // Add best 3 electives
  const electiveSubjects = ['electiveMath', 'physics', 'chemistry', 'biology', 'economics', 'government', 'literature', 'geography'];
  const electiveGrades: number[] = [];
  
  electiveSubjects.forEach(subject => {
    const grade = grades[subject as keyof WassceeGrades];
    if (grade && grade !== '') {
      electiveGrades.push(gradeToNumber(grade));
    }
  });

  // Sort electives (best first) and take best 3
  electiveGrades.sort((a, b) => a - b);
  const bestThreeElectives = electiveGrades.slice(0, 3);
  total += bestThreeElectives.reduce((sum, grade) => sum + grade, 0);

  return total;
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

        // Map common subject variations
        switch (subjectKey) {
          case 'electivemathematics':
            studentGrade = grades.electiveMath;
            break;
          case 'integratedscience':
            studentGrade = grades.science;
            break;
          case 'socialstudies':
            studentGrade = grades.social;
            break;
          default:
            studentGrade = grades[subjectKey as keyof WassceeGrades];
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
    const aggregatePoints = calculateAggregatePoints(grades);

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

            // Handle various elective subject mappings
            if (subject.includes('elective mathematics')) {
              studentGrade = grades.electiveMath;
            } else if (subject.includes('physics')) {
              studentGrade = grades.physics;
            } else if (subject.includes('chemistry')) {
              studentGrade = grades.chemistry;
            } else if (subject.includes('biology')) {
              studentGrade = grades.biology;
            } else if (subject.includes('economics')) {
              studentGrade = grades.economics;
            } else if (subject.includes('government')) {
              studentGrade = grades.government;
            } else if (subject.includes('literature')) {
              studentGrade = grades.literature;
            } else if (subject.includes('geography')) {
              studentGrade = grades.geography;
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

        // Check aggregate points if specified
        if (requirement.aggregatePoints && aggregatePoints > requirement.aggregatePoints) {
          if (aggregatePoints <= requirement.aggregatePoints + 3) {
            borderline = true;
            details.push(`Aggregate: ${aggregatePoints}/${requirement.aggregatePoints} (close)`);
          } else {
            eligible = false;
            details.push(`Aggregate: ${aggregatePoints}/${requirement.aggregatePoints} (too high)`);
          }
        } else if (requirement.aggregatePoints) {
          details.push(`Aggregate: ✓ ${aggregatePoints}/${requirement.aggregatePoints}`);
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

      // Calculate match score for sorting
      const matchScore = status === 'eligible' ? 100 
        : status === 'multiple_tracks' ? 95
        : status === 'borderline' ? 70 
        : 30;

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
        requirementComplexity: requirement.requirementComplexity
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