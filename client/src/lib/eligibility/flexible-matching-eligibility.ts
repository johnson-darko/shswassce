// Flexible matching eligibility logic for KNUST programs
import { gradeToNumber } from '../offline-eligibility-engine';

export function checkFlexibleMatchingEligibility(combo: any, requirement: any, programName: string) {
  let details: string[] = [];
  // BSc Human Settlement Planning
  if (programName === 'BSC. HUMAN SETTLEMENT PLANNING') {
    const groupA = [
      'economics', 'introduction to business management', 'geography',
      'government', 'mathematics', 'financial accounting', 'cost accounting', 'graphic design'
    ];
    const groupB = [
      'accounting', 'technical drawing', 'graphic design', 'picture making',
      'sculpture', 'physics', 'painting', 'history', 'building technology',
      'woodwork', 'metalwork', 'general knowledge in art'
    ];
    const electives = combo.electiveSubjects.filter((e: any) => gradeToNumber(e.grade) <= 6);
    const hasGeography = electives.some((e: any) => e.subject.trim().toLowerCase() === 'geography');
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    if (hasGeography && aggregateEligible) {
      const groupAWithoutGeography = groupA.filter(s => s !== 'geography');
      const groupAElig = electives.filter((e: any) => groupAWithoutGeography.includes(e.subject.trim().toLowerCase()));
      const groupBElig = electives.filter((e: any) => groupB.includes(e.subject.trim().toLowerCase()));
      let option1 = groupAElig.length >= 2;
      let option2 = groupAElig.length >= 1 && groupBElig.length >= 1;
      if (option1 || option2) {
        details.push('Eligible for Human Settlement Planning.');
      } else {
        details.push('You do not meet the full elective requirements.');
      }
      return {
        eligible: option1 || option2,
        details
      };
    }
    return { eligible: false, details: ['Missing Geography or aggregate requirement.'] };
  }
  // BSc Development Planning
  if (programName === 'BSC. DEVELOPMENT PLANNING') {
    const eligibleElectives = [
      'geography', 'economics', 'government', 'history',
      'business management', 'accounting', 'mathematics (elective)',
      'biology', 'chemistry', 'physics'
    ];
    let countC6 = 0;
    for (const e of combo.electiveSubjects) {
      if (eligibleElectives.includes(e.subject.trim().toLowerCase()) && gradeToNumber(e.grade) <= 6) {
        countC6++;
      }
    }
    let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
    if (countC6 >= 3 && aggregateEligible) {
      details.push('Eligible for Development Planning.');
      return { eligible: true, details };
    }
    return { eligible: false, details: ['Not enough eligible electives or aggregate too high.'] };
  }
  return { eligible: false, details: ['No flexible matching logic for this program.'] };
}
/**
 * Flexible Matching Eligibility Logic
 * ----------------------------------
 * Used for programs that allow multiple combinations of electives.
 * Example: BSC. DEVELOPMENT PLANNING, BSC. HUMAN SETTLEMENT PLANNING, etc.
 * Checks for different ways to qualify (multiple valid combinations).
 *
 * How it works:
 * - Checks for core subjects.
 * - Evaluates multiple elective combinations/options for eligibility.
 * - Returns feedback on which option is met or what is missing.
 */
