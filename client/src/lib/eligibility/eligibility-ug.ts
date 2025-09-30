import type { EligibilityResult, WassceeGrades } from '@shared/schema';
import { gradeToNumber, meetsGradeRequirement, calculateAllAggregateCombinations, normalizeSubjectName } from '../offline-eligibility-engine';
import requirements from '../../public/data/requirements-ug.json';

const STANDARD_PROGRAM_NAMES = [
  'Bachelor of Education in Early Grade Specialism (Distance)',
  'Bachelor of Education in Upper Primary Specialism (Distance)',
  'Bachelor of Education in JHS Specialism (Distance)',
  'Bachelor of Arts (Distance)',
  'Bachelor of Science in Business Administration (Distance)',
  'B.Ed. in Upper Grade Specialism',
  'B.Ed. in Early Grade Specialism',
  'B.Ed. in JHS Specialism',
  'B.Ed. in Social Studies',
  'B.Ed. in Spanish',
  'B.Ed. in Arabic',
  'B.Ed. in Performing Arts (Dance)',
  'B.Ed. in Performing Arts (Music)',
  'B.Ed. in Performing Arts (Theatre Arts)',
  'B.Ed. in Physical Education and Health',
  'B.A. in Sport and Physical Culture Studies',
  'Bachelor of Fine Arts'
];

export function checkEligibilityUG(grades: WassceeGrades, programs: any[], requirements: any[]): EligibilityResult[] {
  const results: EligibilityResult[] = [];
  const allAggregateCombinations = calculateAllAggregateCombinations(grades);
  const bestAggregatePoints = allAggregateCombinations.length > 0 ? allAggregateCombinations[0].aggregate : 999;
  for (const program of programs) {
    const programRequirements = requirements.filter(req => req.programId === program.id);
    if (programRequirements.length === 0) {
      continue; // Skip programs without requirements
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
      // Use standard logic for the current batch of programs by name
      if (STANDARD_PROGRAM_NAMES.includes(program.name)) {
        for (const combo of allAggregateCombinations) {
          let coreEligible = true;
          let coreDetails: string[] = [];
          const comboGrades: any = { ...grades };
          for (const c of combo.coreSubjects) {
            const key = (c.subject ?? '').toLowerCase().replace(/\s+/g, '');
            comboGrades[key] = c.grade;
          }
          // Flexible core subject logic for standard programs
          coreEligible = true;
          coreDetails = [];

          // Strict elective matching logic
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
                  // If 'ANY' is present, accept any elective subject with the required grade
                  if (reqElective.subjects && reqElective.subjects.length === 1 && reqElective.subjects[0] === 'ANY') {
                    for (let i = 0; i < combo.electiveSubjects.length; i++) {
                      if (usedElectiveIndexes.has(i)) continue;
                      const e = combo.electiveSubjects[i];
                      if (meetsGradeRequirement(e.grade ?? '', reqElective.min_grade ?? '')) {
                        matches.push({ idx: i, e });
                      }
                    }
                  } else {
                    for (let i = 0; i < combo.electiveSubjects.length; i++) {
                      if (usedElectiveIndexes.has(i)) continue;
                      const e = combo.electiveSubjects[i];
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
      } else {
        // Custom logic for future programs goes here
        if (program.name === 'Bachelor of Science in Information Technology (Distance)') {
          // Use only English, Mathematics, Integrated Science and any N electives for aggregate calculation
          for (const combo of allAggregateCombinations) {
            // Use combo.coreSubjects for core selection and grade checking
            let coreEligible = true;
            let coreDetails: string[] = [];
            for (const c of combo.coreSubjects) {
              if (!requirement.coreSubjects.compulsory.includes(c.subject)) continue;
              if (!meetsGradeRequirement(c.grade ?? '', requirement.coreSubjects.minGrade)) {
                coreEligible = false;
                coreDetails.push(`${c.subject}: Need ${requirement.coreSubjects.minGrade}`);
              } else {
                coreDetails.push(`${c.subject}: ✓ ${c.grade}`);
              }
            }
            // Electives: any N with required grade, from combo.electiveSubjects
            let electivesEligible = true;
            let electivesDetails: string[] = [];
            const electiveCount = requirement.electiveSubjects[0].count;
            const electiveMinGrade = requirement.electiveSubjects[0].minGrade;
            let eligibleElectives = combo.electiveSubjects.filter((e: { subject: string, grade: string }) => meetsGradeRequirement(e.grade, electiveMinGrade));
            if (eligibleElectives.length >= electiveCount) {
              for (let i = 0; i < electiveCount; i++) {
                electivesDetails.push(`${eligibleElectives[i].subject}: ✓ ${eligibleElectives[i].grade}`);
              }
            } else {
              electivesEligible = false;
              electivesDetails.push(`Need at least ${electiveCount} electives with ${electiveMinGrade} or better`);
            }
            // Aggregate: sum of selected core + best N electives
            let aggregateSubjects = [
              ...combo.coreSubjects.filter((c: { subject: string }) => requirement.coreSubjects.compulsory.includes(c.subject)),
              ...eligibleElectives.slice(0, electiveCount)
            ];
            let aggregate = aggregateSubjects.reduce((sum, s) => sum + gradeToNumber(s.grade ?? 'F9'), 0);
            let aggregateEligible = aggregate <= requirement.aggregatePoints;
            if (coreEligible && electivesEligible && aggregateEligible) {
              eligibleCombo = { combo, coreDetails, electivesDetails, aggregate };
              break;
            } else if (coreEligible && electivesEligible && aggregate <= (requirement.aggregatePoints || 999) + 3) {
              borderlineCombo = { combo, coreDetails, electivesDetails, aggregate };
            }
          }
        } else {
          // Example: if (program.name === 'Some New Program') { ... }
          continue;
        }
      }
      if (eligibleCombo) {
        status = 'eligible';
        message = 'You meet all CORE requirements for this program!';
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
                        // For standard programs, 'any' elective logic: only check grade, ignore subject names
                        // This does NOT affect future/custom programs
  results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  return results;
}
