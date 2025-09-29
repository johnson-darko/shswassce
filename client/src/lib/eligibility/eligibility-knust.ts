// ...existing code...
import { checkGroup1Eligibility } from './group1-eligibility';
import { checkGroup2Eligibility } from './group2-eligibility';
import { checkCustomEligibility } from './custom-eligibility';
import { checkDefaultEligibility } from './default-eligibility';
import { checkFlexibleMatchingEligibility } from './flexible-matching-eligibility';
import { checkSimpleEligibility } from './simple-eligibility';
// ...existing code...
import type { EligibilityResult, WassceeGrades } from '@shared/schema';
import { gradeToNumber, meetsGradeRequirement, calculateAllAggregateCombinations, normalizeSubjectName } from '../offline-eligibility-engine';
// import requirements from '../../public/data/requirements-knust.json';

export function checkEligibilityKNUST(grades: WassceeGrades, programs: any[], requirements: any[]): EligibilityResult[] {
  const results: EligibilityResult[] = [];
  const allAggregateCombinations = calculateAllAggregateCombinations(grades);
  const bestAggregatePoints = allAggregateCombinations.length > 0 ? allAggregateCombinations[0].aggregate : 999;
  let matchScore = 0;
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

  let eligibleCombo: any = null;
  let borderlineCombo: any = null;

        // Custom logic for all custom programs (delegated to custom-eligibility.ts)
        if ([
          'BSC. NATURAL RESOURCE MANAGEMENT',
          'BSC. FOREST RESOURCE TECHNOLOGY',
          'BSC. AQUACULTURE AND WATER RESOURCE MANAGEMENT',
          'BSC. LAND ECONOMY',
          'BSC. REAL ESTATE',
          'BSC. ARCHITECTURE',
          'BSC. AGRIBUSINESS MANAGEMENT',
          'BSC. LANDSCAPE DESIGN AND MANAGEMENT',
          'BSC. CONSTRUCTION TECHNOLOGY AND MANAGEMENT (BUILDING TECHNOLOGY)',
          'BSC. QUANTITY SURVEYING AND CONSTRUCTION ECONOMICS (BUILDING TECHNOLOGY)'
        ].includes(program.name.trim().toUpperCase())) {
          for (const combo of allAggregateCombinations) {
            const customResult = checkCustomEligibility(combo, requirement, program.name.trim().toUpperCase());
            if (customResult.eligible) {
              // Only use customResult.details for details, and append aggregate if not present
              let detailsArr = [...customResult.details];
              const aggregateLine = `Aggregate: ✓ ${combo.aggregate}/${requirement.aggregatePoints}`;
              if (!detailsArr.some(d => d.includes('Aggregate:'))) {
                detailsArr.push(aggregateLine);
              }
              eligibleCombo = { combo, coreDetails: [], electivesDetails: detailsArr };
              break;
            }
          }
        }
        // Group 2 shared eligibility logic
        else if ( [
          'BSC. BIOCHEMISTRY',
          'FOOD SCIENCE AND TECHNOLOGY',
          'DOCTOR OF OPTOMETRY (OD)',
          'BSC. CHEMISTRY',
          'BSC. PHYSICS',
          'BSC. METEOROLOGY AND CLIMATE SCIENCE',
          'BSC. MATHEMATICS',
          'BSC. STATISTICS',
          'BSC. ACTUARIAL SCIENCE',
          'BSC. COMPUTER SCIENCE',
          'BSC. AGRICULTURE',
          'BSC. AGRICULTURAL BIOTECHNOLOGY',
          'BA. HISTORY',
          'BA. POLITICAL STUDIES',
          'BA. GEOGRAPHY AND RURAL DEVELOPMENT',
          'BA. ENGLISH',
          'BA. FRENCH AND FRANCOPHONE STUDIES',
          'BA. AKAN LANGUAGE AND CULTURE',
          'BA. SOCIOLOGY',
          'BA. SOCIAL WORK'
        ].includes(program.name.trim().toUpperCase())) {
          for (const combo of allAggregateCombinations) {
            const group2Result = checkGroup2Eligibility(combo, requirement, program.name.trim().toUpperCase());
            if (group2Result.eligible) {
              eligibleCombo = { combo, coreDetails: [], electivesDetails: group2Result.details };
              break;
            }
          }
      }
      // Group 1 shared eligibility logic
      else if ([
        'BSC. PACKAGING TECHNOLOGY',
        'BA. METAL PRODUCT DESIGN TECHNOLOGY',
        'BSC. TEXTILE DESIGN AND TECHNOLOGY',
        'BSC. FASHION DESIGN',
        'BFA. CERAMICS',
        'B.ED. (ART AND DESIGN TECHNOLOGY)',
        'BA. INTEGRATED RURAL ART AND INDUSTRY',
        'BSC. DISABILITY AND REHABILITATION STUDIES',
        'BACHELOR OF PUBLIC ADMINISTRATION',
        'BA. RELIGION AND HUMAN DEVELOPMENT',
        'BACHELOR OF LAW (LLB)',
        'BSC. BUSINESS ADMINISTRATION (HUMAN RESOURCE MANAGEMENT/MANAGEMENT)',
        'BSC. BUSINESS ADMINISTRATION (MARKETING/INTERNATIONAL BUSINESS)',
        'BSC. HOSPITALITY AND TOURISM MANAGEMENT',
        'BSC. BUSINESS ADMINISTRATION (ACCOUNTING/BANKING AND FINANCE)',
        'BSC. BUSINESS ADMINISTRATION (LOGISTICS AND SUPPLY CHAIN MANAGEMENT/BUSINESS INFORMATION TECHNOLOGY)'
      ].includes(program.name.trim().toUpperCase())) {
        for (const combo of allAggregateCombinations) {
          const group1Result = checkGroup1Eligibility(combo, requirement, program.name.trim().toUpperCase());
          if (group1Result.eligible) {
            eligibleCombo = { combo, coreDetails: [], electivesDetails: group1Result.details };
            break;
          }
        }
      }
        // ...existing code...
        // List of flexible eligibility programs
        const flexiblePrograms = [
          'BSC. HUMAN SETTLEMENT PLANNING',
          'BSC. DEVELOPMENT PLANNING'
        ];
        if (flexiblePrograms.includes(program.name.trim().toUpperCase())) {
          for (const combo of allAggregateCombinations) {
            const flexResult = checkFlexibleMatchingEligibility(combo, requirement, program.name.trim().toUpperCase());
            if (flexResult.eligible) {
              eligibleCombo = { combo, coreDetails: [], electivesDetails: flexResult.details };
              break;
            }
          }
        }
        // List of default logic programs
        const defaultPrograms = [
          'BFA. FINE ART & CURATORIAL PRACTICE',
          'BA. COMMUNICATION DESIGN (GRAPHIC DESIGN)',
          'BA. PUBLISHING STUDIES',
          'BSC. CERAMIC TECHNOLOGY'
        ];
        if (defaultPrograms.includes(program.name.trim().toUpperCase())) {
          for (const combo of allAggregateCombinations) {
            const defaultResult = checkDefaultEligibility(combo, requirement, program.name.trim().toUpperCase());
            if (defaultResult.eligible) {
              eligibleCombo = { combo, coreDetails: [], electivesDetails: defaultResult.details };
              break;
            }
          }
        }
        // List of simple eligibility programs
        const simplePrograms = [
          'B.ED. JUNIOR HIGH SCHOOL EDUCATION',
          'BED JUNIOR HIGH SCHOOL EDUCATION'
        ];
        if (simplePrograms.includes(program.name.trim().toUpperCase())) {
          for (const combo of allAggregateCombinations) {
            const simpleResult = checkSimpleEligibility(combo, requirement);
            if (simpleResult.eligible) {
              eligibleCombo = { combo, coreDetails: [], electivesDetails: simpleResult.details };
              break;
            }
          }
        }

        // ...existing code...
      // Default logic for other programs
      else {
          for (const combo of allAggregateCombinations) {
            const defaultResult = checkDefaultEligibility(combo, requirement);
            if (defaultResult.eligible) {
              eligibleCombo = { combo, coreDetails: [], electivesDetails: defaultResult.details };
              break;
            }
          }
      }

      if (eligibleCombo) {
        status = 'eligible';
        // For custom programs, don't prepend generic message, just use details from eligibleCombo
        if ([
          'BSC. NATURAL RESOURCE MANAGEMENT',
          'BSC. FOREST RESOURCE TECHNOLOGY',
          'BSC. AQUACULTURE AND WATER RESOURCE MANAGEMENT',
          'BSC. LAND ECONOMY',
          'BSC. REAL ESTATE',
          'BSC. ARCHITECTURE',
          'BSC. AGRIBUSINESS MANAGEMENT',
          'BSC. LANDSCAPE DESIGN AND MANAGEMENT'
        ].includes(program.name.trim().toUpperCase())) {
          message = '';
          details = [...eligibleCombo.electivesDetails];
        } else {
          message = 'You meet all CORE requirements for this program!';
          details = [...eligibleCombo.coreDetails, ...eligibleCombo.electivesDetails, `Aggregate: ✓ ${eligibleCombo.combo.aggregate}/${requirement.aggregatePoints}`];
        }
        usedCombination = eligibleCombo.combo.combination;
        combinationFromBest = eligibleCombo.combo.isBest;
  } else if (borderlineCombo && borderlineCombo.combo) {
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
  matchScore = 30;
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
