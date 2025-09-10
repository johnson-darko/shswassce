// ...existing code...
import { checkGroup1Eligibility } from './group1-eligibility';
import { checkGroup2Eligibility } from './group2-eligibility';
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

      let eligibleCombo = null;
      let borderlineCombo = null;

        // Custom logic for Faculty of Natural Resource Management
        // Strict matching for BSc Natural Resource Management, Forest Resource Technology, Aquaculture and Water Resource Management
        if ([
        'BSC. NATURAL RESOURCE MANAGEMENT',
        'BSC. FOREST RESOURCE TECHNOLOGY',
        'BSC. AQUACULTURE AND WATER RESOURCE MANAGEMENT'
      ].includes(program.name.trim().toUpperCase())) {
        for (const combo of allAggregateCombinations) {
          // Core: English, Mathematics, Integrated Science
          const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
          const hasEnglish = coreSubjects.includes('english language');
          const hasMath = coreSubjects.includes('mathematics');
          const hasScience = coreSubjects.includes('integrated science');
          let coreEligible = hasEnglish && hasMath && hasScience;
          let coreDetails: string[] = [];
          if (!coreEligible) {
            coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
          }
          // Electives: Chemistry, Physics or Mathematics, and Biology or General Agriculture
          let electivesEligible = false;
          let electivesDetails: string[] = [];
          let chem = false, physOrMath = false, bioOrAgri = false;
          for (const e of combo.electiveSubjects) {
            const subj = normalizeSubjectName(e.subject);
            if (subj.includes('chemistry')) chem = true;
            if (subj.includes('physics') || subj.includes('mathematics')) physOrMath = true;
            if (subj.includes('biology') || subj.includes('generalagriculture')) bioOrAgri = true;
          }
          electivesEligible = chem && physOrMath && bioOrAgri;
          if (!electivesEligible) {
            electivesDetails.push('Missing required electives: Chemistry, Physics/Mathematics, Biology/General Agriculture');
          }
          let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
          if (coreEligible && electivesEligible && aggregateEligible) {
            eligibleCombo = { combo, coreDetails, electivesDetails };
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
        // Flexible matching for BSc Development Planning
        // Flexible matching for BSc Human Settlement Planning
        // Custom logic for BSc Land Economy and BSc Real Estate
        else if (["BSC. LAND ECONOMY", "BSC. REAL ESTATE"].includes(program.name.trim().toUpperCase())) {
          for (const combo of allAggregateCombinations) {
            // Core: English, Mathematics, Integrated Science
            const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
            const hasEnglish = coreSubjects.includes('english language');
            const hasMath = coreSubjects.includes('mathematics');
            const hasScience = coreSubjects.includes('integrated science');
            let coreEligible = hasEnglish && hasMath && hasScience;
            let coreDetails: string[] = [];
            if (!coreEligible) {
              coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
            }
            // Elective logic
            const optionARequired = ['economics', 'geography'];
            const optionAExtra = [
              'accounting', 'business management', 'government', 'business mathematics', 'french',
              'literature in english', 'history', 'building construction', 'technical drawing', 'mathematics (elective)'
            ];
            const optionBRequired = ['economics'];
            const optionBOthers = [
              'elective mathematics', 'geography', 'accounting', 'business management', 'business mathematics',
              'government', 'french', 'building construction', 'technical drawing', 'general knowledge in art'
            ];
            const electives = combo.electiveSubjects.filter(e => gradeToNumber(e.grade) <= 6);
            // Option A: Economics + Geography + one from extra
            const hasEconomicsA = electives.some(e => e.subject.trim().toLowerCase() === 'economics');
            const hasGeographyA = electives.some(e => e.subject.trim().toLowerCase() === 'geography');
            const hasExtraA = electives.some(e => optionAExtra.includes(e.subject.trim().toLowerCase()));
            let optionA = hasEconomicsA && hasGeographyA && hasExtraA;
            // Option B: Economics + any two from optionBOthers
            const hasEconomicsB = electives.some(e => e.subject.trim().toLowerCase() === 'economics');
            const countBOthers = electives.filter(e => optionBOthers.includes(e.subject.trim().toLowerCase())).length;
            let optionB = hasEconomicsB && countBOthers >= 2;
            let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
            if (coreEligible && aggregateEligible && (optionA || optionB)) {
              eligibleCombo = { combo, coreDetails, electivesDetails: [
                'To be fully eligible for Land Economy or Real Estate:',
                'Option 1: Pass Economics, Geography, and one of these: Accounting, Business Management, Government, Business Mathematics, French, Literature in English, History, Building Construction, Technical Drawing, Mathematics (Elective).',
                'OR',
                'Option 2: Pass Economics and any two of these: Elective Mathematics, Geography, Accounting, Business Management, Business Mathematics, Government, French, Building Construction, Technical Drawing, General Knowledge in Art.',
                'Your electives and grades:',
                electives.map(e => `${e.subject} (${e.grade})`).join(', ')
              ] };
              break;
            } else if (coreEligible && aggregateEligible) {
              // Set borderlineCombo if Economics is present OR if both Economics and Geography are present
              if (hasEconomicsA || hasEconomicsB || (hasEconomicsA && hasGeographyA)) {
                let missing = [];
                if (!optionA) {
                  let missingA = [];
                  if (!hasEconomicsA) missingA.push('Economics');
                  if (!hasGeographyA) missingA.push('Geography');
                  if (!hasExtraA) missingA.push('One of: Accounting, Business Management, Government, Business Mathematics, French, Literature in English, History, Building Construction, Technical Drawing, Mathematics (Elective)');
                  if (missingA.length > 0) missing.push('For Option 1, you are missing: ' + missingA.join(', '));
                }
                if (!optionB) {
                  let missingB = [];
                  if (!hasEconomicsB) missingB.push('Economics');
                  if (countBOthers < 2) missingB.push('Two of: Elective Mathematics, Geography, Accounting, Business Management, Business Mathematics, Government, French, Building Construction, Technical Drawing, General Knowledge in Art');
                  if (missingB.length > 0) missing.push('For Option 2, you are missing: ' + missingB.join(', '));
                }
                borderlineCombo = { combo, coreDetails, electivesDetails: [
                  'To be fully eligible, check your electives:',
                  'Option 1: Pass Economics, Geography, and one of these: Accounting, Business Management, Government, Business Mathematics, French, Literature in English, History, Building Construction, Technical Drawing, Mathematics (Elective).',
                  'OR',
                  'Option 2: Pass Economics and any two of these: Elective Mathematics, Geography, Accounting, Business Management, Business Mathematics, Government, French, Building Construction, Technical Drawing, General Knowledge in Art.',
                  'Your electives and grades:',
                  electives.map(e => `${e.subject} (${e.grade})`).join(', '),
                  ...missing
                ] };
                break;
              }
              // If Economics is missing, do not set borderlineCombo; let post-loop logic mark as not eligible
            }
          }
          // After loop: if no eligible or borderline combo, and Economics is missing, mark as not eligible
          if (!eligibleCombo && !borderlineCombo) {
            const hasEconomics = allAggregateCombinations.some(combo =>
              combo.electiveSubjects.some(e =>
                e.subject && e.subject.trim().toLowerCase() === 'economics' && gradeToNumber(e.grade) <= 6
              )
            );
            if (!hasEconomics) {
              status = 'not_eligible';
              message = 'You do not meet the elective requirements: Economics is required.';
              details = ['You meet the core subject requirements, but you do not have Economics as an elective, which is required for Land Economy and Real Estate.'];
              recommendations = ['Consider retaking Economics as an elective to qualify.'];
              matchScore = 0;
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
              results.push(outcome);
            }
          }
        }
        else if (program.name.trim().toUpperCase() === 'BSC. HUMAN SETTLEMENT PLANNING') {
          for (const combo of allAggregateCombinations) {
            // Core: English, Mathematics, Integrated Science
            const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
            const hasEnglish = coreSubjects.includes('english language');
            const hasMath = coreSubjects.includes('mathematics');
            const hasScience = coreSubjects.includes('integrated science');
            let coreEligible = hasEnglish && hasMath && hasScience;
            let coreDetails: string[] = [];
            if (!coreEligible) {
              coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
            }
            // Elective logic: Group A and Group B
            const groupA = [
              'economics', 'introduction to business management', 'geography',
              'government', 'mathematics', 'financial accounting', 'cost accounting', 'graphic design'
            ];
            const groupB = [
              'accounting', 'technical drawing', 'graphic design', 'picture making',
              'sculpture', 'physics', 'painting', 'history', 'building technology',
              'woodwork', 'metalwork', 'general knowledge in art'
            ];
            // Find eligible electives
            const electives = combo.electiveSubjects.filter(e => gradeToNumber(e.grade) <= 6);
            const hasGeography = electives.some(e => e.subject.trim().toLowerCase() === 'geography');
            let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
            if (coreEligible && aggregateEligible && hasGeography) {
              // Option 1: Geography + any two from groupA (excluding Geography itself)
              const groupAWithoutGeography = groupA.filter(s => s !== 'geography');
              const groupAElig = electives.filter(e => groupAWithoutGeography.includes(e.subject.trim().toLowerCase()));
              // Option 2: Geography + one from groupA (excluding Geography) + one from groupB
              const groupBElig = electives.filter(e => groupB.includes(e.subject.trim().toLowerCase()));
              let option1 = groupAElig.length >= 2;
              let option2 = groupAElig.length >= 1 && groupBElig.length >= 1;
              eligibleCombo = { combo, coreDetails, electivesDetails: [
                'To be fully eligible check these electives:',
                'Option 1: Pass Geography and any two of these: Economics, Introduction to Business Management, Government, Mathematics, Financial Accounting, Cost Accounting, Graphic Design.',
                'OR',
                'Option 2: Pass Geography and one more from the list above, PLUS one from this list: Accounting, Technical Drawing, Graphic Design, Picture Making, Sculpture, Physics, Painting, History, Building Technology, Woodwork, Metalwork, General Knowledge in Art.',
                'Here are your elective subjects and grades:',
                electives.map(e => `${e.subject} (${e.grade})`).join(', '),
                option1 ? 'You meet Option 1 requirements.' : '',
                (!option1 && option2) ? 'You meet Option 2 requirements.' : '',
                (!option1 && !option2) ? 'You do not meet the full elective requirements. Check the options above.' : ''
              ] };
              break;
            }
          }
        }
        else if (program.name.trim().toUpperCase() === 'BSC. DEVELOPMENT PLANNING') {
          for (const combo of allAggregateCombinations) {
            // Core: English, Mathematics, Integrated Science
            const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
            const hasEnglish = coreSubjects.includes('english language');
            const hasMath = coreSubjects.includes('mathematics');
            const hasScience = coreSubjects.includes('integrated science');
            let coreEligible = hasEnglish && hasMath && hasScience;
            let coreDetails: string[] = [];
            if (!coreEligible) {
              coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
            }
            // Electives: Any 3 from Arts, Business, or Science
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
            if (coreEligible && countC6 >= 3 && aggregateEligible) {
              eligibleCombo = { combo, coreDetails, electivesDetails: [
                'Before you apply for this program, make sure you have 3 electives from Arts, Business, or Science with at least C6.'
              ] };
              break;
            } else if (coreEligible && aggregateEligible) {
              borderlineCombo = { combo, coreDetails, electivesDetails: [
                'You meet the core subject requirements. Before you apply for this program, make sure you have at least 3 electives from Arts, Business, or Science with minimum grade C6.'
              ] };
              break;
            }
          }
      }
      // Default logic for other programs
      else if (program.name.trim().toUpperCase() === 'BFA. FINE ART & CURATORIAL PRACTICE') {
        for (const combo of allAggregateCombinations) {
          // Core: English, Mathematics, Integrated Science
          const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
          const hasEnglish = coreSubjects.includes('english language');
          const hasMath = coreSubjects.includes('mathematics');
          const hasScience = coreSubjects.includes('integrated science');
          let coreEligible = hasEnglish && hasMath && hasScience;
          let coreDetails: string[] = [];
          if (!coreEligible) {
            coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
          }
          // Electives: Must have General Knowledge in Art
          const electives = combo.electiveSubjects.filter(e => gradeToNumber(e.grade) <= 6);
          const hasGKA = electives.some(e => e.subject.trim().toLowerCase() === 'general knowledge in art');
          let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
          if (coreEligible && aggregateEligible && hasGKA) {
            // Group electives for feedback
            const groups = {
              'Visual Art': ['graphic design', 'picture making', 'sculpture', 'painting', 'textiles', 'ceramics', 'leatherwork', 'photography'],
              'Home Economics': ['management in living', 'food and nutrition', 'clothing and textiles', 'general knowledge in art'],
              'Technical': ['technical drawing', 'building construction', 'woodwork', 'metalwork', 'electronics', 'auto mechanics', 'applied electricity'],
              'Science': ['biology', 'chemistry', 'physics', 'mathematics (elective)'],
              'General Arts': ['literature in english', 'government', 'history', 'geography', 'economics', 'french', 'christian religious studies', 'islamic religious studies'],
              'Business': ['business management', 'financial accounting', 'cost accounting', 'economics', 'principles of costing', 'office practice', 'typewriting']
            };
            let groupFeedback: string[] = [];
            for (const [group, subjects] of Object.entries(groups)) {
              const matched = electives.filter(e => subjects.includes(e.subject.trim().toLowerCase()) && e.subject.trim().toLowerCase() !== 'general knowledge in art');
              if (matched.length > 0) {
                groupFeedback.push(`${group}: ${matched.map(e => `${e.subject} (${e.grade})`).join(', ')}`);
              }
            }
            eligibleCombo = { combo, coreDetails, electivesDetails: [
              'You have General Knowledge in Art, which is required.',
              'Check which other electives you have under each group:',
              ...groupFeedback,
              'Aggregate:', `${combo.aggregate}/${requirement.aggregatePoints}`
            ] };
            break;
          } else if (coreEligible && aggregateEligible && !hasGKA) {
            eligibleCombo = null;
            borderlineCombo = null;
            status = 'not_eligible';
            message = 'You do not meet the elective requirements: General Knowledge in Art is required.';
            details = ['You meet the core subject requirements, but you do not have General Knowledge in Art as an elective, which is required for this program.'];
            recommendations = ['Consider retaking General Knowledge in Art as an elective to qualify.'];
            matchScore = 0;
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
            results.push(outcome);
            break;
          }
        }
      }
      // Default logic for other programs
      else if (program.name.trim().toUpperCase() === 'BA. COMMUNICATION DESIGN (GRAPHIC DESIGN)') {
        for (const combo of allAggregateCombinations) {
          // Core: English, Mathematics, Integrated Science
          const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
          const hasEnglish = coreSubjects.includes('english language');
          const hasMath = coreSubjects.includes('mathematics');
          const hasScience = coreSubjects.includes('integrated science');
          let coreEligible = hasEnglish && hasMath && hasScience;
          let coreDetails: string[] = [];
          if (!coreEligible) {
            coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
          }
          // Electives: Must have Graphic Design, General Knowledge in Art, ICT
          const electives = combo.electiveSubjects.filter(e => gradeToNumber(e.grade) <= 6);
          const hasGraphicDesign = electives.some(e => e.subject.trim().toLowerCase() === 'graphic design');
          const hasGKA = electives.some(e => e.subject.trim().toLowerCase() === 'general knowledge in art');
          const hasICT = electives.some(e => e.subject.trim().toLowerCase() === 'ict');
          // Find one other Visual Arts elective (excluding Leatherwork, Basketry, Bead making)
          const excluded = ['leatherwork', 'basketry', 'bead making'];
          const otherVisualArts = electives.filter(e => {
            const subj = e.subject.trim().toLowerCase();
            return [
              'picture making', 'sculpture', 'painting', 'textiles', 'ceramics', 'photography', 'technical drawing'
            ].includes(subj) && !excluded.includes(subj);
          });
          let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
          if (coreEligible && aggregateEligible && hasGraphicDesign && hasGKA && hasICT) {
            let detailsMsg = [];
            if (otherVisualArts.length > 0) {
              detailsMsg.push('You have the required electives. Confirm you are a Visual Arts student and check your other electives:');
              detailsMsg.push('Other Visual Arts electives:', otherVisualArts.map(e => `${e.subject} (${e.grade})`).join(', '));
            } else {
              detailsMsg.push('You have the required electives, but do not have an additional Visual Arts elective (excluding Leatherwork, Basketry, Bead making).');
            }
            eligibleCombo = { combo, coreDetails, electivesDetails: [
              'You have Graphic Design, General Knowledge in Art, and ICT, which are required.',
              ...detailsMsg,
              'Aggregate:', `${combo.aggregate}/${requirement.aggregatePoints}`
            ] };
            break;
          } else if (coreEligible && aggregateEligible && (!hasGraphicDesign || !hasGKA || !hasICT)) {
            eligibleCombo = null;
            borderlineCombo = null;
            status = 'not_eligible';
            let missing = [];
            if (!hasGraphicDesign) missing.push('Graphic Design');
            if (!hasGKA) missing.push('General Knowledge in Art');
            if (!hasICT) missing.push('ICT');
            message = 'You do not meet the elective requirements: ' + missing.join(', ') + ' is required.';
            details = ['You meet the core subject requirements, but you do not have all required electives for this program.'];
            recommendations = ['Consider retaking the missing electives to qualify.'];
            matchScore = 0;
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
            results.push(outcome);
            break;
          }
        }
      }
      // Default logic for other programs
      else if (program.name.trim().toUpperCase() === 'BA. PUBLISHING STUDIES') {
        for (const combo of allAggregateCombinations) {
          // Core: English, Mathematics, Integrated Science
          const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
          const hasEnglish = coreSubjects.includes('english language');
          const hasMath = coreSubjects.includes('mathematics');
          const hasScience = coreSubjects.includes('integrated science');
          let coreEligible = hasEnglish && hasMath && hasScience;
          let coreDetails: string[] = [];
          if (!coreEligible) {
            coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
          }
          // Electives: Check all groups for 3 passes (C6 or better)
          const electives = combo.electiveSubjects.filter(e => gradeToNumber(e.grade) <= 6);
          let groupQualified = '';
          // Visual Arts group
          const hasGKA = electives.some(e => e.subject.trim().toLowerCase() === 'general knowledge in art');
          const hasPMorGD = electives.some(e => ['picture making', 'graphic design'].includes(e.subject.trim().toLowerCase()));
          const hasTextilesSculptureLeatherwork = electives.some(e => ['textiles', 'sculpture', 'leatherwork'].includes(e.subject.trim().toLowerCase()));
          if (hasGKA && hasPMorGD && hasTextilesSculptureLeatherwork) {
            groupQualified = 'Visual Arts';
          }
          // General Arts group
          const generalArtsSubjects = ['geography', 'economics', 'government', 'english language', 'history', 'religious studies', 'french', 'ghanaian languages'];
          const generalArtsCount = electives.filter(e => generalArtsSubjects.includes(e.subject.trim().toLowerCase())).length;
          if (generalArtsCount >= 3) {
            groupQualified = 'General Arts';
          }
          // Business group
          const businessSubjects = ['economics', 'accounting', 'introduction to business management', 'business mathematics', 'principles of costing', 'mathematics (elective)'];
          const businessCount = electives.filter(e => businessSubjects.includes(e.subject.trim().toLowerCase())).length;
          if (businessCount >= 3) {
            groupQualified = 'Business';
          }
          // Vocational/Home Economics group
          const hasMgmtLiving = electives.some(e => e.subject.trim().toLowerCase() === 'management in living');
          const hasFoodOrClothing = electives.some(e => ['food and nutrition', 'clothing and textiles'].includes(e.subject.trim().toLowerCase()));
          if (hasGKA && hasMgmtLiving && hasFoodOrClothing) {
            groupQualified = 'Vocational/Home Economics';
          }
          // Science group
          const hasBiology = electives.some(e => e.subject.trim().toLowerCase() === 'biology');
          const hasChemistry = electives.some(e => e.subject.trim().toLowerCase() === 'chemistry');
          const hasMathOrPhysics = electives.some(e => ['mathematics (elective)', 'physics'].includes(e.subject.trim().toLowerCase()));
          if (hasBiology && hasChemistry && hasMathOrPhysics) {
            groupQualified = 'Science';
          }
          let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
          if (coreEligible && aggregateEligible && groupQualified) {
            eligibleCombo = { combo, coreDetails, electivesDetails: [
              'You meet all CORE requirements for this program!',
              `Qualified via group: ${groupQualified}`,
              electives.map(e => `${e.subject} (${e.grade})`).join(', '),
              
            ] };
            break;
          }
        }
      }
      // Simple eligibility for B.Ed. Junior High School Education
      else if ([
        'B.ED. JUNIOR HIGH SCHOOL EDUCATION',
        'BED JUNIOR HIGH SCHOOL EDUCATION'
      ].includes(program.name.trim().toUpperCase())) {
        for (const combo of allAggregateCombinations) {
          const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
          const hasEnglish = coreSubjects.includes('english language');
          const hasMath = coreSubjects.includes('mathematics');
          const hasScience = coreSubjects.includes('integrated science');
          let coreEligible = hasEnglish && hasMath && hasScience;
          let coreDetails: string[] = [];
          if (!coreEligible) {
            coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
          }
          // Any 3 electives with C6 or better
          const electives = combo.electiveSubjects.filter(e => gradeToNumber(e.grade) <= 6);
          let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
          const allTeachingOptions = [
            'To be Fully Eligible for Mathematics, Science, ICT, or Agricultural Science: You must be a Science, General Agriculture, or ICT student with 3 passes in your electives.',
            'To be Fully Eligible for Visual Art: You must be a Visual Art student with 3 passes in your electives.',
            'To be Fully Eligible for History: You must be a General Arts student (including History) with 3 passes in your electives.',
            'To be Fully Eligible for Geography: You must be a General Arts student (including Geography) with 3 passes in your electives.'
          ];
          if (coreEligible && electives.length >= 3 && aggregateEligible) {
            eligibleCombo = { combo, coreDetails, electivesDetails: [
              ...allTeachingOptions,
               
            ] };
            break;
          }
        }
      }

            // Grouped eligibility for BSc Ceramic Technology
            else if (program.name.trim().toUpperCase() === 'BSC. CERAMIC TECHNOLOGY') {
              for (const combo of allAggregateCombinations) {
                const coreSubjects = combo.coreSubjects.map(s => s.subject.trim().toLowerCase());
                const hasEnglish = coreSubjects.includes('english language');
                const hasMath = coreSubjects.includes('mathematics');
                const hasScience = coreSubjects.includes('integrated science');
                let coreEligible = hasEnglish && hasMath && hasScience;
                let coreDetails: string[] = [];
                if (!coreEligible) {
                  coreDetails.push('Missing required core subjects: English, Mathematics, Integrated Science');
                }
                let aggregateEligible = !requirement.aggregatePoints || combo.aggregate <= requirement.aggregatePoints;
                // Elective logic for each group
                const electives = combo.electiveSubjects.filter(e => gradeToNumber(e.grade) <= 6);
                let groupQualified = '';
                // Visual Art group
                const hasCeramics = electives.some(e => e.subject.trim().toLowerCase() === 'ceramics');
                const hasGKA = electives.some(e => e.subject.trim().toLowerCase() === 'general knowledge in art');
                const hasChemMathPhys = electives.some(e => ['chemistry', 'mathematics (elective)', 'physics'].includes(e.subject.trim().toLowerCase()));
                if (hasCeramics && hasGKA && hasChemMathPhys) {
                  groupQualified = 'Visual Art';
                }
                // Science group
                const hasMathElective = electives.some(e => e.subject.trim().toLowerCase() === 'mathematics (elective)');
                const hasChemistry = electives.some(e => e.subject.trim().toLowerCase() === 'chemistry');
                const hasPhysOrBio = electives.some(e => ['physics', 'biology'].includes(e.subject.trim().toLowerCase()));
                if (hasMathElective && hasChemistry && hasPhysOrBio) {
                  groupQualified = 'Science';
                }
                // Technical group
                const technicalSubjects = ['technical drawing', 'building construction', 'applied electricity', 'auto mechanics', 'electronics', 'physics'];
                const techCount = electives.filter(e => technicalSubjects.includes(e.subject.trim().toLowerCase())).length;
                if (techCount >= 3) {
                  groupQualified = 'Technical';
                }
                if (coreEligible && aggregateEligible && groupQualified) {
                  eligibleCombo = { combo, coreDetails, electivesDetails: [
                    `You meet the requirements via the ${groupQualified} group.`,
                    electives.map(e => `${e.subject} (${e.grade})`).join(', ')
                  ] };
                  break;
                }
              }
      }
      // Default logic for other programs
      else {
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
