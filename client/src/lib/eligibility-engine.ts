import { WassceeGrades, EligibilityResult } from "@shared/schema";

// WASSCE grade mapping for comparison (lower number = better grade)
export const gradeValues: Record<string, number> = {
  'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
};

export interface ProgramRequirement {
  programId: string;
  programName: string;
  universityName: string;
  coreSubjects: Record<string, string>;
  electiveSubjects: Array<{subject: string, min_grade: string, count?: number}>;
  additionalRequirements?: string;
  aggregatePoints?: number;
}

/**
 * Checks if a student's grade meets the minimum requirement
 */
export function meetsGradeRequirement(studentGrade: string, minimumGrade: string): boolean {
  const studentValue = gradeValues[studentGrade];
  const minimumValue = gradeValues[minimumGrade];
  
  return studentValue <= minimumValue;
}

/**
 * Calculates aggregate points from WASSCE grades
 */
export function calculateAggregatePoints(grades: WassceeGrades): number {
  const gradesList = Object.values(grades).filter(Boolean) as string[];
  
  // Take best 6 subjects for aggregate calculation
  const bestSixGrades = gradesList
    .map(grade => gradeValues[grade])
    .sort((a, b) => a - b)
    .slice(0, 6);
  
  return bestSixGrades.reduce((sum, value) => sum + value, 0);
}

/**
 * Maps grade input keys to subject names
 */
export const subjectMapping: Record<keyof WassceeGrades, string> = {
  english: 'English',
  mathematics: 'Mathematics', 
  science: 'Integrated Science',
  social: 'Social Studies',
  electiveMath: 'Elective Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  economics: 'Economics',
  government: 'Government',
  literature: 'Literature',
  geography: 'Geography'
};

/**
 * Gets the grade for a specific subject from student grades
 */
export function getSubjectGrade(grades: WassceeGrades, subjectName: string): string | undefined {
  const mapping = Object.entries(subjectMapping).find(([_, name]) => name === subjectName);
  if (mapping) {
    return grades[mapping[0] as keyof WassceeGrades];
  }
  return undefined;
}

/**
 * Checks core subject requirements
 */
export function checkCoreRequirements(
  grades: WassceeGrades, 
  coreRequirements: Record<string, string>
): { passed: boolean; details: string[]; recommendations: string[] } {
  const details: string[] = [];
  const recommendations: string[] = [];
  let allPassed = true;

  for (const [subject, minGrade] of Object.entries(coreRequirements)) {
    const studentGrade = getSubjectGrade(grades, subject);
    
    if (!studentGrade) {
      allPassed = false;
      details.push(`❌ ${subject} grade not provided`);
      recommendations.push(`Please provide your ${subject} grade`);
      continue;
    }

    if (meetsGradeRequirement(studentGrade, minGrade)) {
      const studentValue = gradeValues[studentGrade];
      const requiredValue = gradeValues[minGrade];
      
      if (studentValue === requiredValue) {
        details.push(`⚠️ ${subject}: ${studentGrade} (meets minimum requirement)`);
      } else {
        details.push(`✓ ${subject}: ${studentGrade} (exceeds requirement of ${minGrade})`);
      }
    } else {
      allPassed = false;
      details.push(`❌ ${subject}: ${studentGrade} (requires ${minGrade} or better)`);
      recommendations.push(`Improve ${subject} grade to ${minGrade} or better`);
    }
  }

  return { passed: allPassed, details, recommendations };
}

/**
 * Checks elective subject requirements
 */
export function checkElectiveRequirements(
  grades: WassceeGrades,
  electiveRequirements: Array<{subject: string, min_grade: string, count?: number}>
): { passed: boolean; details: string[]; recommendations: string[] } {
  const details: string[] = [];
  const recommendations: string[] = [];
  let electivesMet = 0;

  for (const elective of electiveRequirements) {
    if (elective.subject.toLowerCase().includes('any')) {
      // Handle "any X electives" requirements
      const requiredCount = elective.count || (elective.subject.includes('2') ? 2 : 1);
      
      // Get all available elective grades
      const electiveGrades = [
        grades.electiveMath, grades.physics, grades.chemistry, grades.biology,
        grades.economics, grades.government, grades.literature, grades.geography
      ].filter(Boolean) as string[];
      
      const qualifyingElectives = electiveGrades.filter(grade => 
        meetsGradeRequirement(grade, elective.min_grade)
      );
      
      if (qualifyingElectives.length >= requiredCount) {
        electivesMet++;
        details.push(`✓ ${elective.subject}: ${qualifyingElectives.length} qualifying subjects`);
      } else {
        details.push(`❌ ${elective.subject}: Only ${qualifyingElectives.length} of ${requiredCount} required`);
        recommendations.push(`Improve elective grades to meet ${elective.min_grade} or better`);
      }
    } else {
      // Handle specific elective subject requirements
      const studentGrade = getSubjectGrade(grades, elective.subject);
      
      if (!studentGrade) {
        details.push(`❌ ${elective.subject} grade not provided`);
        recommendations.push(`Please provide your ${elective.subject} grade`);
      } else if (meetsGradeRequirement(studentGrade, elective.min_grade)) {
        electivesMet++;
        details.push(`✓ ${elective.subject}: ${studentGrade} (meets requirement of ${elective.min_grade})`);
      } else {
        details.push(`❌ ${elective.subject}: ${studentGrade} (requires ${elective.min_grade} or better)`);
        recommendations.push(`Improve ${elective.subject} grade to ${elective.min_grade} or better`);
      }
    }
  }

  const passed = electivesMet >= electiveRequirements.length;
  return { passed, details, recommendations };
}

/**
 * Evaluates eligibility for a single program
 */
export function evaluateProgramEligibility(
  grades: WassceeGrades,
  requirement: ProgramRequirement
): EligibilityResult {
  const allDetails: string[] = [];
  const allRecommendations: string[] = [];

  // Check core requirements
  const coreCheck = checkCoreRequirements(grades, requirement.coreSubjects);
  allDetails.push(...coreCheck.details);
  allRecommendations.push(...coreCheck.recommendations);

  // Check elective requirements
  const electiveCheck = checkElectiveRequirements(grades, requirement.electiveSubjects);
  allDetails.push(...electiveCheck.details);
  allRecommendations.push(...electiveCheck.recommendations);

  // Check aggregate points if specified
  let aggregateOk = true;
  if (requirement.aggregatePoints) {
    const studentAggregate = calculateAggregatePoints(grades);
    if (studentAggregate <= requirement.aggregatePoints) {
      allDetails.push(`✓ Aggregate: ${studentAggregate} points (within limit of ${requirement.aggregatePoints})`);
    } else {
      aggregateOk = false;
      allDetails.push(`❌ Aggregate: ${studentAggregate} points (exceeds limit of ${requirement.aggregatePoints})`);
      allRecommendations.push(`Improve overall grades to reduce aggregate points below ${requirement.aggregatePoints}`);
    }
  }

  // Determine overall status
  let status: EligibilityResult['status'];
  let message: string;

  const coreRequirementsMet = coreCheck.passed;
  const electiveRequirementsMet = electiveCheck.passed;
  const borderlineCore = coreCheck.details.some(detail => detail.includes('⚠️'));

  if (coreRequirementsMet && electiveRequirementsMet && aggregateOk) {
    status = borderlineCore ? 'borderline' : 'eligible';
    message = borderlineCore 
      ? 'Borderline - Consider improving one grade'
      : 'Fully Eligible - All requirements met';
  } else {
    status = 'not_eligible';
    message = 'Not Eligible - Core requirements not met';
  }

  return {
    programId: requirement.programId,
    programName: requirement.programName,
    universityName: requirement.universityName,
    status,
    message,
    details: allDetails,
    recommendations: allRecommendations.length > 0 ? allRecommendations : undefined
  };
}

/**
 * Sorts eligibility results by status priority
 */
export function sortEligibilityResults(results: EligibilityResult[]): EligibilityResult[] {
  const statusOrder: Record<string, number> = { 'eligible': 0, 'borderline': 1, 'not_eligible': 2, 'multiple_tracks': 3 };
  
  return results.sort((a, b) => {
    const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    if (statusDiff !== 0) return statusDiff;
    
    // Secondary sort by university name
    return a.universityName.localeCompare(b.universityName);
  });
}

/**
 * Filters results to show only programs the student is eligible for
 */
export function getEligiblePrograms(results: EligibilityResult[]): EligibilityResult[] {
  return results.filter(result => result.status === 'eligible');
}

/**
 * Gets improvement suggestions based on eligibility results
 */
export function getImprovementSuggestions(results: EligibilityResult[]): string[] {
  const suggestions = new Set<string>();
  
  results.forEach(result => {
    if (result.recommendations) {
      result.recommendations.forEach(rec => suggestions.add(rec));
    }
  });
  
  return Array.from(suggestions);
}
