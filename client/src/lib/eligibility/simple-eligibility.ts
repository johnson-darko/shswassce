// Simple eligibility logic for B.Ed. Junior High School Education
import { gradeToNumber } from '../offline-eligibility-engine';

export function checkSimpleEligibility(combo: any, requirement: any) {
  let details: string[] = [];
  const coreSubjects = combo.coreSubjects.map((s: any) => s.subject.trim().toLowerCase());
  const hasEnglish = coreSubjects.includes('english language');
  const hasMath = coreSubjects.includes('mathematics');
  const hasScience = coreSubjects.includes('integrated science');
  let coreEligible = hasEnglish && hasMath && hasScience;
  if (!coreEligible) {
    details.push('Missing required core subjects: English, Mathematics, Integrated Science');
  }
  // Any 3 electives with C6 or better
  const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
  let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
  if (coreEligible && electives.length >= 3 && aggregateEligible) {
    details.push('Eligible for B.Ed. Junior High School Education.');
    return { eligible: true, details };
  }
  return { eligible: false, details: ['Not enough eligible electives or aggregate too high.'] };
}
/**
 * Simple Eligibility Logic
 * -----------------------
 * Used for programs with very basic requirements.
 * Example: B.ED. JUNIOR HIGH SCHOOL EDUCATION, etc.
 * Checks for any 3 electives with C6 or better.
 *
 * How it works:
 * - Checks for required core subjects.
 * - Verifies minimum number of passes in electives.
 * - Returns feedback on eligibility.
 */
