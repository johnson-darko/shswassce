import type { 
  WassceeGrades, 
  EligibilityResult, 
  AdmissionTrack, 
  ElectiveOption,
  University,
  Program,
  Requirement
} from "@shared/schema";

// WASSCE grade mapping for comparison
const gradeValues: Record<string, number> = {
  'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
};

export function checkEnhancedEligibility(
  grades: WassceeGrades, 
  university: University, 
  program: Program, 
  requirement: Requirement
): EligibilityResult {
  
  // Check if this is a complex multi-track program
  if (requirement.requirementComplexity === 'advanced' && requirement.admissionTracks) {
    return checkMultiTrackEligibility(grades, university, program, requirement);
  }
  
  // Standard eligibility check for basic/intermediate programs
  return checkStandardEligibility(grades, university, program, requirement);
}

function checkMultiTrackEligibility(
  grades: WassceeGrades, 
  university: University, 
  program: Program, 
  requirement: Requirement
): EligibilityResult {
  
  const coreSubjects = requirement.coreSubjects as Record<string, string>;
  const admissionTracks = requirement.admissionTracks as any[];
  
  // Check core subjects first
  const coreResult = checkCoreSubjects(grades, coreSubjects);
  if (!coreResult.passed) {
    return {
      programId: program.id,
      programName: program.name,
      universityName: university.name,
      status: 'not_eligible',
      message: 'Core subject requirements not met',
      details: coreResult.details,
      recommendations: coreResult.recommendations,
      requirementComplexity: 'advanced'
    };
  }
  
  // Check each admission track
  const trackResults: AdmissionTrack[] = [];
  let bestTrackMatch = '';
  let hasEligibleTrack = false;
  let hasBorderlineTrack = false;
  
  for (const track of admissionTracks) {
    const trackResult = evaluateAdmissionTrack(grades, track);
    trackResults.push(trackResult);
    
    if (trackResult.status === 'eligible') {
      hasEligibleTrack = true;
      if (!bestTrackMatch) bestTrackMatch = track.name;
    } else if (trackResult.status === 'borderline') {
      hasBorderlineTrack = true;
      if (!bestTrackMatch && !hasEligibleTrack) bestTrackMatch = track.name;
    }
  }
  
  // Determine overall status
  let status: EligibilityResult['status'] = 'not_eligible';
  let message = 'No admission tracks match your grades';
  
  if (hasEligibleTrack) {
    status = 'multiple_tracks';
    message = `Eligible for ${trackResults.filter(t => t.status === 'eligible').length} admission track(s)`;
  } else if (hasBorderlineTrack) {
    status = 'borderline';
    message = 'Borderline eligibility for some tracks - consider improving grades';
  }
  
  const allDetails = [
    ...coreResult.details,
    `Ways you can apply: ${trackResults.length}`,
    ...trackResults.flatMap(track => [`${track.name}: ${track.status}`, ...track.matchDetails])
  ];
  
  return {
    programId: program.id,
    programName: program.name,
    universityName: university.name,
    status,
    message,
    details: allDetails,
    recommendations: coreResult.recommendations,
    careerOutcomes: program.careerOutcomes as string[] || [],
    averageSalary: program.averageSalary || undefined,
    employmentRate: program.employmentRate || undefined,
    admissionTracks: trackResults,
    bestTrackMatch,
    requirementComplexity: 'advanced'
  };
}

function evaluateAdmissionTrack(grades: WassceeGrades, track: any): AdmissionTrack {
  const trackResult: AdmissionTrack = {
    name: track.name,
    description: track.description,
    electiveOptions: track.electiveOptions,
    additionalRequirements: track.additionalRequirements,
    status: 'not_eligible',
    matchDetails: []
  };
  
  let hasEligibleOption = false;
  let hasBorderlineOption = false;
  
  // Check each elective option within the track
  for (const option of track.electiveOptions) {
    const optionResult = evaluateElectiveOption(grades, option);
    
    if (optionResult.status === 'eligible') {
      hasEligibleOption = true;
      trackResult.matchDetails.push(`✓ ${option.name}: All requirements met`);
      trackResult.matchDetails.push(...optionResult.details);
    } else if (optionResult.status === 'borderline') {
      hasBorderlineOption = true;
      trackResult.matchDetails.push(`⚠️ ${option.name}: Borderline eligibility`);
      trackResult.matchDetails.push(...optionResult.details);
    } else {
      trackResult.matchDetails.push(`❌ ${option.name}: Requirements not met`);
      trackResult.matchDetails.push(...optionResult.details);
    }
  }
  
  // Determine track status
  if (hasEligibleOption) {
    trackResult.status = 'eligible';
  } else if (hasBorderlineOption) {
    trackResult.status = 'borderline';
  }
  
  return trackResult;
}

function evaluateElectiveOption(grades: WassceeGrades, option: ElectiveOption) {
  const details: string[] = [];
  let eligible = true;
  let borderline = false;
  
  // Map grade fields to subject names for easier lookup
  const gradeMap: Record<string, string | undefined> = {
    'Chemistry': grades.chemistry,
    'Physics': grades.physics,
    'Biology': grades.biology,
    'Mathematics': grades.mathematics,
    'Elective Mathematics': grades.electiveMath,
    'Economics': grades.economics,
    'Geography': grades.geography,
    'Government': grades.government,
    'Literature': grades.literature,
    'Accounting': undefined, // Not in our current grade schema
    'Business Management': undefined, // Not in our current grade schema
    'General Agriculture': undefined // Not in our current grade schema
  };
  
  // Check required subjects
  for (const subject of option.subjects) {
    const requiredGrade = option.minGrades[subject];
    const studentGrade = gradeMap[subject];
    
    if (!studentGrade) {
      eligible = false;
      details.push(`❌ ${subject}: Grade not provided`);
    } else if (requiredGrade) {
      const studentValue = gradeValues[studentGrade];
      const requiredValue = gradeValues[requiredGrade];
      
      if (studentValue > requiredValue) {
        eligible = false;
        details.push(`❌ ${subject}: ${studentGrade} (requires ${requiredGrade} or better)`);
      } else if (studentValue === requiredValue) {
        borderline = true;
        details.push(`⚠️ ${subject}: ${studentGrade} (meets minimum requirement)`);
      } else {
        details.push(`✓ ${subject}: ${studentGrade} (exceeds requirement of ${requiredGrade})`);
      }
    }
  }
  
  // Check additional rules (like minimum B3 in Integrated Science)
  if (option.additionalRules) {
    for (const rule of option.additionalRules) {
      if (rule.includes('B3 in Integrated Science')) {
        const integratedScienceGrade = grades.science;
        if (!integratedScienceGrade) {
          eligible = false;
          details.push(`❌ Additional requirement: Integrated Science grade not provided`);
        } else if (gradeValues[integratedScienceGrade] > 3) {
          eligible = false;
          details.push(`❌ Additional requirement: Integrated Science ${integratedScienceGrade} (requires B3 or better)`);
        } else {
          details.push(`✓ Additional requirement: Integrated Science ${integratedScienceGrade} meets B3 requirement`);
        }
      }
    }
  }
  
  return {
    status: eligible ? 'eligible' : (borderline ? 'borderline' : 'not_eligible'),
    details
  };
}

function checkStandardEligibility(
  grades: WassceeGrades, 
  university: University, 
  program: Program, 
  requirement: Requirement
): EligibilityResult {
  
  const coreSubjects = requirement.coreSubjects as Record<string, string>;
  const electiveSubjects = requirement.electiveSubjects as Array<{subject: string, min_grade: string}>;
  
  // Check core subjects
  const coreResult = checkCoreSubjects(grades, coreSubjects);
  
  // Check elective subjects
  const electiveResult = checkElectiveSubjects(grades, electiveSubjects);
  
  let status: EligibilityResult['status'] = 'not_eligible';
  let message = 'Requirements not met';
  
  if (coreResult.passed && electiveResult.passed) {
    status = (coreResult.borderline || electiveResult.borderline) ? 'borderline' : 'eligible';
    message = status === 'borderline' 
      ? 'Borderline eligibility - consider improving grades'
      : 'Fully eligible - all requirements met';
  } else {
    message = 'Core or elective requirements not met';
  }
  
  const allDetails = [
    ...coreResult.details,
    ...electiveResult.details
  ];
  
  const allRecommendations = [
    ...coreResult.recommendations,
    ...electiveResult.recommendations
  ];
  
  return {
    programId: program.id,
    programName: program.name,
    universityName: university.name,
    status,
    message,
    details: allDetails,
    recommendations: allRecommendations.length > 0 ? allRecommendations : undefined,
    careerOutcomes: program.careerOutcomes as string[] || [],
    averageSalary: program.averageSalary || undefined,
    employmentRate: program.employmentRate || undefined,
    requirementComplexity: requirement.requirementComplexity as any || 'basic'
  };
}

function checkCoreSubjects(grades: WassceeGrades, coreSubjects: Record<string, string>) {
  const details: string[] = [];
  const recommendations: string[] = [];
  let passed = true;
  let borderline = false;
  
  const coreSubjectMap: Record<string, keyof WassceeGrades> = {
    'English': 'english',
    'Mathematics': 'mathematics', 
    'Integrated Science': 'science',
    'Social Studies': 'social'
  };
  
  for (const [subject, minGrade] of Object.entries(coreSubjects)) {
    const gradeKey = coreSubjectMap[subject];
    if (!gradeKey || !grades[gradeKey]) {
      passed = false;
      details.push(`❌ ${subject} grade not provided`);
      recommendations.push(`Please provide your ${subject} grade`);
      continue;
    }
    
    const studentGrade = grades[gradeKey]!;
    const studentValue = gradeValues[studentGrade];
    const requiredValue = gradeValues[minGrade];
    
    if (studentValue > requiredValue) {
      passed = false;
      details.push(`❌ ${subject}: ${studentGrade} (requires ${minGrade} or better)`);
      recommendations.push(`Improve ${subject} grade to ${minGrade} or better`);
    } else if (studentValue === requiredValue) {
      borderline = true;
      details.push(`⚠️ ${subject}: ${studentGrade} (meets minimum requirement)`);
    } else {
      details.push(`✓ ${subject}: ${studentGrade} (exceeds requirement of ${minGrade})`);
    }
  }
  
  return { passed, borderline, details, recommendations };
}

function checkElectiveSubjects(grades: WassceeGrades, electiveSubjects: Array<{subject: string, min_grade: string}>) {
  const details: string[] = [];
  const recommendations: string[] = [];
  let passed = true;
  let borderline = false;
  
  for (const elective of electiveSubjects) {
    if (elective.subject.includes("Any")) {
      // Handle "Any other elective" or "Any TWO from..." cases
      const electiveGrades: string[] = [];
      
      // Get all elective grades from the new flexible structure
      for (let i = 1; i <= 4; i++) {
        const gradeKey = `elective${i}Grade` as keyof WassceeGrades;
        const subjectKey = `elective${i}Subject` as keyof WassceeGrades;
        
        const grade = grades[gradeKey];
        const subject = grades[subjectKey];
        
        if (grade && grade !== '' && subject && subject !== '') {
          electiveGrades.push(grade);
        }
      }
      
      const qualifyingElectives = electiveGrades.filter(grade => 
        gradeValues[grade!] <= gradeValues[elective.min_grade]
      );
      
      const requiredCount = elective.subject.includes("TWO") ? 2 : 1;
      if (qualifyingElectives.length >= requiredCount) {
        details.push(`✓ ${elective.subject}: ${qualifyingElectives.length} qualifying subjects`);
      } else {
        passed = false;
        details.push(`❌ ${elective.subject}: Only ${qualifyingElectives.length} of ${requiredCount} required`);
        recommendations.push(`Improve elective grades to meet ${elective.min_grade} or better`);
      }
    } else {
      // Handle specific elective subjects
      const subjectGrade = getElectiveGrade(grades, elective.subject);
      
      if (!subjectGrade) {
        passed = false;
        details.push(`❌ ${elective.subject} grade not provided`);
        recommendations.push(`Please provide your ${elective.subject} grade`);
      } else {
        const studentValue = gradeValues[subjectGrade];
        const requiredValue = gradeValues[elective.min_grade];
        
        if (studentValue > requiredValue) {
          passed = false;
          details.push(`❌ ${elective.subject}: ${subjectGrade} (requires ${elective.min_grade} or better)`);
          recommendations.push(`Improve ${elective.subject} grade to ${elective.min_grade} or better`);
        } else if (studentValue === requiredValue) {
          borderline = true;
          details.push(`⚠️ ${elective.subject}: ${subjectGrade} (meets minimum requirement)`);
        } else {
          details.push(`✓ ${elective.subject}: ${subjectGrade} (exceeds requirement of ${elective.min_grade})`);
        }
      }
    }
  }
  
  return { passed, borderline, details, recommendations };
}

function getElectiveGrade(grades: WassceeGrades, subject: string): string | undefined {
  // Search through all 4 elective slots to find the matching subject
  for (let i = 1; i <= 4; i++) {
    const subjectKey = `elective${i}Subject` as keyof WassceeGrades;
    const gradeKey = `elective${i}Grade` as keyof WassceeGrades;
    
    const studentSubject = grades[subjectKey];
    const studentGrade = grades[gradeKey];
    
    // Check if this elective slot matches the required subject
    if (studentSubject === subject && studentGrade) {
      return studentGrade;
    }
    
    // Also check for common subject name variations
    const normalizedStudentSubject = studentSubject?.toLowerCase().replace(/\s+/g, '');
    const normalizedRequiredSubject = subject.toLowerCase().replace(/\s+/g, '');
    
    if (normalizedStudentSubject === normalizedRequiredSubject && studentGrade) {
      return studentGrade;
    }
    
    // Handle specific subject mappings
    if ((subject === "Elective Mathematics" || subject === "Mathematics (Elective)") && 
        (studentSubject === "Mathematics (Elective)" || studentSubject === "Elective Mathematics") && 
        studentGrade) {
      return studentGrade;
    }
  }
  
  return undefined;
}