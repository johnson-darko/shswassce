import type { EligibilityResult, WassceeGrades } from '@shared/schema';
import { gradeToNumber, meetsGradeRequirement, calculateAllAggregateCombinations, normalizeSubjectName } from '../offline-eligibility-engine';
// import requirements from '../../public/data/requirements-ucc.json';

export function checkEligibilityUCC(grades: WassceeGrades, programs: any[], requirements: any[]): EligibilityResult[] {
  const results: EligibilityResult[] = [];
  const allAggregateCombinations = calculateAllAggregateCombinations(grades);
  const bestAggregatePoints = allAggregateCombinations.length > 0 ? allAggregateCombinations[0].aggregate : 999;
  for (const program of programs) {
    const programRequirements = requirements.filter(req => req.programId === program.id);
    if (programRequirements.length === 0) {
      continue;
    }
    let bestOutcome = null;
    for (const requirement of programRequirements) {
      let status: 'eligible' | 'borderline' | 'not_eligible' | 'multiple_tracks' = 'not_eligible';
      let message = '';
      let details: string[] = [];
      let recommendations: string[] = [];
      let admissionTracks: any[] = [];
      let bestTrackMatch: string | undefined;
      let usedCombination: string | undefined;
      let combinationFromBest = false;

      let eligibleCombo = null;
      let borderlineCombo = null;
      if (requirement.requirementComplexity === 'advanced' && requirement.admissionTracks) {
        continue;
      }
      for (const combo of allAggregateCombinations) {
        let coreEligible = true;
        let coreDetails: string[] = [];
        const comboGrades: any = { ...grades };
        for (const c of combo.coreSubjects) {
          const key = (c.subject ?? '').toLowerCase().replace(/\s+/g, '');
          comboGrades[key] = c.grade;
        }
        coreEligible = true;
        coreDetails = [];

        let electivesEligible = true;
        let electivesDetails: string[] = [];
        const usedElectiveIndexes: Set<number> = new Set();
        let singlesMatched = 0;
        let anyMatched = 0;
        if (requirement.electiveSubjects && requirement.electiveSubjects.length > 0) {
          for (const reqElective of requirement.electiveSubjects) {
            let found = false;
            if (reqElective.type === 'single') {
              for (let i = 0; i < combo.electiveSubjects.length; i++) {
                if (usedElectiveIndexes.has(i)) continue;
                const e = combo.electiveSubjects[i];
                if (normalizeSubjectName(e.subject ?? '') === normalizeSubjectName(reqElective.subject ?? '')) {
                  if (meetsGradeRequirement(e.grade ?? '', reqElective.min_grade ?? '')) {
                    found = true;
                    electivesDetails.push(`${e.subject}: ✓ ${e.grade}`);
                    usedElectiveIndexes.add(i);
                    singlesMatched++;
                    break;
                  }
                }
              }
              if (!found) {
                electivesEligible = false;
                electivesDetails.push(`${reqElective.subject}: Need ${reqElective.min_grade}`);
              }
            } else if (reqElective.type === 'any') {
              let matches: { idx: number, e: any }[] = [];
              for (let i = 0; i < combo.electiveSubjects.length; i++) {
                if (usedElectiveIndexes.has(i)) continue;
                const e = combo.electiveSubjects[i];
                if (reqElective.subjects.some((s: string) => normalizeSubjectName(e.subject ?? '') === normalizeSubjectName(s ?? ''))) {
                  if (meetsGradeRequirement(e.grade ?? '', reqElective.min_grade ?? '')) {
                    matches.push({ idx: i, e });
                  }
                }
              }
              if (matches.length >= reqElective.count) {
                for (let j = 0; j < reqElective.count; j++) {
                  electivesDetails.push(`${matches[j].e.subject}: ✓ ${matches[j].e.grade}`);
                  usedElectiveIndexes.add(matches[j].idx);
                  anyMatched++;
                }
              } else {
                matches.forEach(m => {
                  electivesDetails.push(`${m.e.subject}: ✓ ${m.e.grade}`);
                  usedElectiveIndexes.add(m.idx);
                });
                electivesEligible = false;
                electivesDetails.push(`Any ${reqElective.count} from: Need at least ${reqElective.count} subjects with ${reqElective.min_grade} or better`);
              }
            }
          }
        }
        const singlesRequired = requirement.electiveSubjects.filter((e: any) => e.type === 'single').length;
        const anyRequired = requirement.electiveSubjects.filter((e: any) => e.type === 'any').reduce((sum: number, e: any) => sum + (e.count || 0), 0);
        electivesEligible = electivesEligible && (singlesMatched === singlesRequired) && (anyMatched === anyRequired);

        let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
        if (coreEligible && electivesEligible && aggregateEligible) {
          eligibleCombo = { combo, coreDetails, electivesDetails };
          break;
        } else if (coreEligible && electivesEligible && combo.aggregate <= (requirement.aggregatePoints || 999) + 3) {
          borderlineCombo = { combo, coreDetails, electivesDetails };
        }
      }
      if (eligibleCombo) {
        status = 'eligible';
        message = 'You meet all requirements for this program!';
        details = [...eligibleCombo.coreDetails, ...eligibleCombo.electivesDetails, `Aggregate: ✓ ${eligibleCombo.combo.aggregate}/${requirement.aggregatePoints}`];
        usedCombination = eligibleCombo.combo.combination;
        combinationFromBest = eligibleCombo.combo.isBest;
      } else if (borderlineCombo) {
        status = 'borderline';
        message = 'You\'re close to meeting the requirements';
        details = [...borderlineCombo.coreDetails, ...borderlineCombo.electivesDetails, `Aggregate: ${borderlineCombo.combo.aggregate}/${requirement.aggregatePoints} (close)`];
        usedCombination = borderlineCombo.combo.combination;
        combinationFromBest = borderlineCombo.combo.isBest;
        recommendations.push('Consider retaking subjects with borderline grades');
        recommendations.push('Apply anyway as requirements may be flexible');
      } else {
        status = 'not_eligible';
        message = 'You do not meet the current requirements';
        recommendations.push('Consider retaking key subjects to improve grades');
        recommendations.push('Look for foundation or bridging programs');
      }
      let matchScore = 30;
      if (status === 'eligible') {
        matchScore = combinationFromBest ? 100 : 90;
      } else if (status === 'borderline') {
        matchScore = combinationFromBest ? 70 : 60;
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
        admissionTracks,
        bestTrackMatch,
        requirementComplexity: requirement.requirementComplexity,
        usedCombination,
        combinationFromBest,
        matchedRequirementId: requirement.id
      };
      if (status === 'eligible') {
        bestOutcome = outcome;
        break;
      }
      if (!bestOutcome || (outcome.matchScore ?? 0) > (bestOutcome.matchScore ?? 0)) {
        bestOutcome = outcome;
      }
    }
    if (bestOutcome) results.push(bestOutcome);
  }
  results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  return results;
}
