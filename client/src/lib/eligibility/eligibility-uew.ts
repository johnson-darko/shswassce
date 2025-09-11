import type { EligibilityResult, WassceeGrades } from '@shared/schema';
import { gradeToNumber, calculateAllAggregateCombinations } from '../offline-eligibility-engine';
// TODO: When you get the correct elective requirements and specific program data for UCC,
// update this logic to:
// 1. Check electiveSubjects for each program and match user grades accordingly.
// 2. Enforce aggregatePoints and additionalRequirements as needed.
// 3. Provide detailed eligibility feedback per program, similar to the KNUST logic.

export function checkEligibilityUEW(grades: WassceeGrades, programs: any[], requirements: any[]): EligibilityResult[] {
  const results: EligibilityResult[] = [];
  for (const program of programs) {
    const programRequirements = requirements.filter(req => req.programId === program.id);
    if (programRequirements.length === 0) {
      continue;
    }
    let bestOutcome = null;
    for (const requirement of programRequirements) {
      let status: 'eligible' | 'not_eligible' = 'not_eligible';
      let message = '';
      let details: string[] = [];
      let recommendations: string[] = [];
      let matchScore = 0;
      // Check English and Math (must have both)
      const compulsory = requirement.coreSubjects.compulsory;
      const hasEnglish = compulsory.some((s: any) => s.subject.toLowerCase() === 'english language' && gradeToNumber(grades['english language']) <= 6);
      const hasMath = compulsory.some((s: any) => s.subject.toLowerCase() === 'mathematics' && gradeToNumber(grades['mathematics']) <= 6);
      // Check any from Integrated Science or Social Studies
      let hasScienceOrSocial = false;
      if (requirement.coreSubjects.any) {
        const anySubjects = requirement.coreSubjects.any.subjects;
        hasScienceOrSocial = anySubjects.some((sub: string) => gradeToNumber(grades[sub.toLowerCase()]) <= 6);
      }
      if (hasEnglish && hasMath && hasScienceOrSocial) {
        status = 'eligible';
        message = 'You meet all CORE requirements for this program! To be fully Eligible, we will update the Elective Requirements for UEW and check if you pass.';
        details = ['You have credit passes in English Language, Mathematics, and at least one of Integrated Science or Social Studies.'];
        matchScore = 100;
      } else {
        status = 'not_eligible';
        message = 'You do not meet the current core requirements.';
        details = ['You must have credit passes (C6 or better) in English Language, Mathematics, and at least one of Integrated Science or Social Studies.'];
        matchScore = 0;
      }
      const outcome = {
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
        admissionTracks: [],
        bestTrackMatch: undefined,
        requirementComplexity: requirement.requirementComplexity,
        usedCombination: undefined,
        combinationFromBest: false,
        matchedRequirementId: requirement.id
      };
      bestOutcome = outcome;
      break;
    }
    if (bestOutcome) results.push(bestOutcome);
  }
  results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  return results;
}
