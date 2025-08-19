import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  searchFiltersSchema, 
  wassceeGradesSchema, 
  programSearchFiltersSchema,
  userPreferencesSchema,
  toggleFavoriteSchema,
  exportRequestSchema,
  type EligibilityResult, 
  type WassceeGrades,
  type ProgramSearchFilters,
  type UserPreferences,
  type ToggleFavorite,
  type ExportRequest 
} from "@shared/schema";

// WASSCE grade mapping for comparison
const gradeValues: Record<string, number> = {
  'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
};

function checkEligibility(grades: WassceeGrades): Promise<EligibilityResult[]> {
  return new Promise(async (resolve) => {
    const results: EligibilityResult[] = [];
    
    // Get all universities and their programs
    const universities = await storage.getAllUniversities();
    
    for (const university of universities) {
      const programs = await storage.getProgramsByUniversity(university.id);
      
      for (const program of programs) {
        const requirements = await storage.getRequirementsByProgram(program.id);
        
        if (requirements.length === 0) continue;
        
        const requirement = requirements[0];
        const coreSubjects = requirement.coreSubjects as Record<string, string>;
        const electiveSubjects = requirement.electiveSubjects as Array<{subject: string, min_grade: string}>;
        
        let eligible = true;
        let borderline = false;
        const details: string[] = [];
        const recommendations: string[] = [];
        
        // Check core subjects
        const coreSubjectMap: Record<string, keyof WassceeGrades> = {
          'English': 'english',
          'Mathematics': 'mathematics',
          'Integrated Science': 'science',
          'Social Studies': 'social'
        };
        
        for (const [subject, minGrade] of Object.entries(coreSubjects)) {
          const gradeKey = coreSubjectMap[subject];
          if (!gradeKey || !grades[gradeKey]) {
            eligible = false;
            details.push(`❌ ${subject} grade not provided`);
            recommendations.push(`Please provide your ${subject} grade`);
            continue;
          }
          
          const studentGrade = grades[gradeKey]!;
          const studentValue = gradeValues[studentGrade];
          const requiredValue = gradeValues[minGrade];
          
          if (studentValue > requiredValue) {
            eligible = false;
            details.push(`❌ ${subject}: ${studentGrade} (requires ${minGrade} or better)`);
            recommendations.push(`Improve ${subject} grade to ${minGrade} or better`);
          } else if (studentValue === requiredValue) {
            borderline = true;
            details.push(`⚠️ ${subject}: ${studentGrade} (meets minimum requirement)`);
          } else {
            details.push(`✓ ${subject}: ${studentGrade} (exceeds requirement of ${minGrade})`);
          }
        }
        
        // Check elective subjects
        let electivesMetCount = 0;
        for (const elective of electiveSubjects) {
          if (elective.subject === "Any other elective" || elective.subject === "Any other 2 electives") {
            // Count available electives that meet requirement
            const electiveGrades = [
              grades.electiveMath, grades.physics, grades.chemistry, grades.biology,
              grades.economics, grades.government, grades.literature, grades.geography
            ].filter(Boolean);
            
            const qualifyingElectives = electiveGrades.filter(grade => 
              gradeValues[grade!] <= gradeValues[elective.min_grade]
            );
            
            const requiredCount = elective.subject.includes("2") ? 2 : 1;
            if (qualifyingElectives.length >= requiredCount) {
              electivesMetCount++;
              details.push(`✓ ${elective.subject}: ${qualifyingElectives.length} qualifying subjects`);
            } else {
              eligible = false;
              details.push(`❌ ${elective.subject}: Only ${qualifyingElectives.length} of ${requiredCount} required`);
              recommendations.push(`Improve elective grades to meet ${elective.min_grade} or better`);
            }
          } else {
            // Specific elective subject
            let subjectGrade: string | undefined;
            switch (elective.subject) {
              case "Elective Mathematics":
                subjectGrade = grades.electiveMath;
                break;
              case "Physics":
                subjectGrade = grades.physics;
                break;
              case "Chemistry":
                subjectGrade = grades.chemistry;
                break;
              case "Biology":
                subjectGrade = grades.biology;
                break;
              case "Economics":
                subjectGrade = grades.economics;
                break;
              case "Government":
                subjectGrade = grades.government;
                break;
              case "Literature":
                subjectGrade = grades.literature;
                break;
              case "Geography":
                subjectGrade = grades.geography;
                break;
            }
            
            if (!subjectGrade) {
              eligible = false;
              details.push(`❌ ${elective.subject} grade not provided`);
              recommendations.push(`Please provide your ${elective.subject} grade`);
            } else {
              const studentValue = gradeValues[subjectGrade];
              const requiredValue = gradeValues[elective.min_grade];
              
              if (studentValue > requiredValue) {
                eligible = false;
                details.push(`❌ ${elective.subject}: ${subjectGrade} (requires ${elective.min_grade} or better)`);
                recommendations.push(`Improve ${elective.subject} grade to ${elective.min_grade} or better`);
              } else {
                electivesMetCount++;
                details.push(`✓ ${elective.subject}: ${subjectGrade} (meets requirement of ${elective.min_grade})`);
              }
            }
          }
        }
        
        let status: 'eligible' | 'borderline' | 'not_eligible';
        let message: string;
        
        if (eligible && electivesMetCount >= electiveSubjects.length) {
          status = borderline ? 'borderline' : 'eligible';
          message = borderline 
            ? 'Borderline - Consider improving one grade'
            : 'Fully Eligible - All requirements met';
        } else {
          status = 'not_eligible';
          message = 'Not Eligible - Core requirements not met';
        }
        
        results.push({
          programId: program.id,
          programName: program.name,
          universityName: university.name,
          status,
          message,
          details,
          recommendations: recommendations.length > 0 ? recommendations : undefined,
          careerOutcomes: program.careerOutcomes as string[] || [],
          averageSalary: program.averageSalary || undefined,
          employmentRate: program.employmentRate || undefined,
          isFavorite: false // Will be updated based on user preferences
        });
      }
    }
    
    // Sort results: eligible first, then borderline, then not eligible
    results.sort((a, b) => {
      const statusOrder = { 'eligible': 0, 'borderline': 1, 'not_eligible': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
    
    resolve(results);
  });
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Search universities
  app.get("/api/universities/search", async (req, res) => {
    try {
      const filters = searchFiltersSchema.parse(req.query);
      const universities = await storage.searchUniversities(filters);
      res.json(universities);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Get all universities
  app.get("/api/universities", async (req, res) => {
    try {
      const universities = await storage.getAllUniversities();
      res.json(universities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch universities" });
    }
  });

  // Get university by ID
  app.get("/api/universities/:id", async (req, res) => {
    try {
      const university = await storage.getUniversity(req.params.id);
      if (!university) {
        return res.status(404).json({ message: "University not found" });
      }
      res.json(university);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch university" });
    }
  });

  // Get programs for a university
  app.get("/api/universities/:id/programs", async (req, res) => {
    try {
      const programs = await storage.getProgramsByUniversity(req.params.id);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  // Search programs (must come before :id routes)
  app.get("/api/programs/search", async (req, res) => {
    try {
      const filters = programSearchFiltersSchema.parse(req.query);
      const programs = await storage.searchPrograms(filters);
      
      // Enhance programs with university data
      const enhancedPrograms = await Promise.all(
        programs.map(async (program) => {
          const university = await storage.getUniversity(program.universityId);
          return {
            ...program,
            universityName: university?.name,
            universityType: university?.type,
            universityRegion: university?.region,
          };
        })
      );
      
      res.json(enhancedPrograms);
    } catch (error) {
      console.error('Programs search error:', error);
      res.status(500).json({ message: "Failed to search programs", error: (error as Error).message });
    }
  });

  // Get program by ID
  app.get("/api/programs/:id", async (req, res) => {
    try {
      const program = await storage.getProgram(req.params.id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  // Get requirements for a program
  app.get("/api/programs/:id/requirements", async (req, res) => {
    try {
      const requirements = await storage.getRequirementsByProgram(req.params.id);
      res.json(requirements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requirements" });
    }
  });

  // Compare universities
  app.post("/api/universities/compare", async (req, res) => {
    try {
      const { universityIds } = req.body;
      if (!Array.isArray(universityIds) || universityIds.length === 0) {
        return res.status(400).json({ message: "Invalid university IDs" });
      }

      const universities = await Promise.all(
        universityIds.map(id => storage.getUniversity(id))
      );

      const validUniversities = universities.filter(Boolean);
      res.json(validUniversities);
    } catch (error) {
      res.status(500).json({ message: "Failed to compare universities" });
    }
  });

  // Check eligibility
  app.post("/api/check-eligibility", async (req, res) => {
    try {
      const grades = wassceeGradesSchema.parse(req.body);
      const results = await checkEligibility(grades);
      res.json(results);
    } catch (error) {
      res.status(400).json({ message: "Invalid grade data" });
    }
  });

  // Programs eligibility endpoint (same as check-eligibility)
  app.post("/api/programs/eligibility", async (req, res) => {
    try {
      const grades = wassceeGradesSchema.parse(req.body);
      const results = await checkEligibility(grades);
      res.json(results);
    } catch (error) {
      res.status(400).json({ message: "Invalid grade data" });
    }
  });

  // User endpoints
  app.post("/api/user/grades", async (req, res) => {
    try {
      const grades = wassceeGradesSchema.parse(req.body);
      // For now, just echo back the grades as confirmation
      res.json(grades);
    } catch (error) {
      res.status(400).json({ message: "Invalid grade data" });
    }
  });

  app.get("/api/user/preferences", async (req, res) => {
    try {
      // Return empty preferences for now
      res.json({});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post("/api/user/preferences", async (req, res) => {
    try {
      const preferences = userPreferencesSchema.parse(req.body);
      // For now, just echo back the preferences
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ message: "Invalid preference data" });
    }
  });

  // Get scholarships for a university
  app.get("/api/universities/:id/scholarships", async (req, res) => {
    try {
      const scholarships = await storage.getScholarshipsByUniversity(req.params.id);
      res.json(scholarships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scholarships" });
    }
  });

  // Enhanced routes for program-driven eligibility

  // Get universities offering a specific program
  app.get("/api/programs/:programName/universities", async (req, res) => {
    try {
      const universities = await storage.getUniversitiesByProgram(req.params.programName);
      res.json(universities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch universities" });
    }
  });

  // Get scholarships for a program
  app.get("/api/programs/:programName/scholarships", async (req, res) => {
    try {
      const scholarships = await storage.getScholarshipsByProgram(req.params.programName);
      res.json(scholarships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scholarships" });
    }
  });

  // Enhanced eligibility check for specific programs
  app.post("/api/check-program-eligibility", async (req, res) => {
    try {
      const { grades, programIds } = req.body;
      const validatedGrades = wassceeGradesSchema.parse(grades);
      
      if (!Array.isArray(programIds) || programIds.length === 0) {
        return res.status(400).json({ message: "Program IDs required" });
      }

      const results: EligibilityResult[] = [];
      
      for (const programId of programIds) {
        const program = await storage.getProgram(programId);
        if (!program) continue;
        
        const university = await storage.getUniversity(program.universityId);
        if (!university) continue;
        
        const requirements = await storage.getRequirementsByProgram(programId);
        if (requirements.length === 0) continue;
        
        const requirement = requirements[0];
        const result = await checkProgramEligibility(validatedGrades, {
          programId: program.id,
          programName: program.name,
          universityName: university.name,
          coreSubjects: requirement.coreSubjects as Record<string, string>,
          electiveSubjects: requirement.electiveSubjects as Array<{subject: string, min_grade: string}>,
          additionalRequirements: requirement.additionalRequirements || undefined,
          aggregatePoints: requirement.aggregatePoints || undefined
        });
        
        results.push(result);
      }
      
      // Sort by eligibility status and add match scores
      const sortedResults = results.sort((a, b) => {
        const statusOrder = { 'eligible': 0, 'borderline': 1, 'not_eligible': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      res.json(sortedResults);
    } catch (error) {
      res.status(400).json({ message: "Invalid eligibility check data" });
    }
  });

  // User preferences
  app.post("/api/user/preferences", async (req, res) => {
    try {
      const preferences = userPreferencesSchema.parse(req.body);
      await storage.saveUserPreferences(preferences);
      res.json({ message: "Preferences saved successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid preferences data" });
    }
  });

  app.get("/api/user/preferences", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences();
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Favorites API routes
  app.post('/api/favorites/toggle', async (req, res) => {
    try {
      const validation = toggleFavoriteSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validation.error.errors });
      }

      const { programId, action } = validation.data;
      // For now, use a dummy user ID since we don't have authentication
      const userId = "user-dummy-001";
      
      await storage.toggleFavoriteProgram(userId, programId, action);
      
      res.json({ 
        message: `Program ${action === 'add' ? 'added to' : 'removed from'} favorites`,
        programId,
        action
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ message: 'Failed to update favorites' });
    }
  });

  app.get('/api/favorites', async (req, res) => {
    try {
      // For now, use a dummy user ID since we don't have authentication
      const userId = "user-dummy-001";
      const favorites = await storage.getUserFavoritePrograms(userId);
      res.json({ favorites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  // Export API route
  app.post('/api/export', async (req, res) => {
    try {
      const validation = exportRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid export request', errors: validation.error.errors });
      }

      const { format, data } = validation.data;
      const { results, userGrades, timestamp } = data;

      if (format === 'csv') {
        // Generate CSV
        const headers = [
          'Program Name', 'University', 'Status', 'Message', 
          'Career Outcomes', 'Average Salary', 'Employment Rate'
        ];
        
        const csvRows = [
          headers.join(','),
          ...results.map((result: EligibilityResult) => [
            `"${result.programName}"`,
            `"${result.universityName}"`,
            `"${result.status}"`,
            `"${result.message}"`,
            `"${(result.careerOutcomes || []).join('; ')}"`,
            result.averageSalary || '',
            result.employmentRate || ''
          ].join(','))
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="eligibility-results-${timestamp}.csv"`);
        res.send(csvRows.join('\n'));
      } else if (format === 'json') {
        // Generate JSON
        const exportData = {
          timestamp,
          userGrades,
          results: results.map((result: EligibilityResult) => ({
            programName: result.programName,
            universityName: result.universityName,
            status: result.status,
            message: result.message,
            careerOutcomes: result.careerOutcomes || [],
            averageSalary: result.averageSalary,
            employmentRate: result.employmentRate,
            details: result.details
          }))
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="eligibility-results-${timestamp}.json"`);
        res.json(exportData);
      } else {
        res.status(400).json({ message: 'Unsupported export format' });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Enhanced eligibility checking function for specific programs
async function checkProgramEligibility(
  grades: WassceeGrades,
  requirement: {
    programId: string;
    programName: string;
    universityName: string;
    coreSubjects: Record<string, string>;
    electiveSubjects: Array<{subject: string, min_grade: string}>;
    additionalRequirements?: string;
    aggregatePoints?: number;
  }
): Promise<EligibilityResult> {
  const details: string[] = [];
  const recommendations: string[] = [];
  let eligible = true;
  let borderline = false;

  // Core subjects mapping
  const coreSubjectMap: Record<string, keyof WassceeGrades> = {
    'English': 'english',
    'Mathematics': 'mathematics',
    'Integrated Science': 'science',
    'Social Studies': 'social'
  };

  // Check core requirements
  for (const [subject, minGrade] of Object.entries(requirement.coreSubjects)) {
    const gradeKey = coreSubjectMap[subject];
    if (!gradeKey || !grades[gradeKey]) {
      eligible = false;
      details.push(`❌ ${subject} grade not provided`);
      recommendations.push(`Please provide your ${subject} grade`);
      continue;
    }

    const studentGrade = grades[gradeKey]!;
    const studentValue = gradeValues[studentGrade];
    const requiredValue = gradeValues[minGrade];

    if (studentValue > requiredValue) {
      eligible = false;
      details.push(`❌ ${subject}: ${studentGrade} (requires ${minGrade} or better)`);
      recommendations.push(`Improve ${subject} grade to ${minGrade} or better`);
    } else if (studentValue === requiredValue) {
      borderline = true;
      details.push(`⚠️ ${subject}: ${studentGrade} (meets minimum requirement)`);
    } else {
      details.push(`✓ ${subject}: ${studentGrade} (exceeds requirement of ${minGrade})`);
    }
  }

  // Check elective requirements
  let electivesMetCount = 0;
  const electiveSubjectMap: Record<string, keyof WassceeGrades> = {
    'Elective Mathematics': 'electiveMath',
    'Physics': 'physics',
    'Chemistry': 'chemistry',
    'Biology': 'biology',
    'Economics': 'economics',
    'Government': 'government',
    'Literature': 'literature',
    'Geography': 'geography'
  };

  for (const elective of requirement.electiveSubjects) {
    if (elective.subject.includes("Any other")) {
      // Handle "any other electives" requirements
      const requiredCount = elective.subject.includes("2") ? 2 : 1;
      const availableElectives = Object.entries(electiveSubjectMap)
        .map(([subject, key]) => ({ subject, grade: grades[key] }))
        .filter(({ grade }) => grade && gradeValues[grade] <= gradeValues[elective.min_grade]);
      
      if (availableElectives.length >= requiredCount) {
        electivesMetCount++;
        details.push(`✓ ${elective.subject}: ${availableElectives.length} qualifying subjects`);
      } else {
        details.push(`❌ ${elective.subject}: Only ${availableElectives.length} of ${requiredCount} required`);
        recommendations.push(`Improve elective grades to meet ${elective.min_grade} or better`);
      }
    } else {
      // Handle specific elective subject
      const gradeKey = electiveSubjectMap[elective.subject];
      if (!gradeKey || !grades[gradeKey]) {
        details.push(`❌ ${elective.subject} grade not provided`);
        recommendations.push(`Please provide your ${elective.subject} grade`);
      } else {
        const studentGrade = grades[gradeKey]!;
        const studentValue = gradeValues[studentGrade];
        const requiredValue = gradeValues[elective.min_grade];
        
        if (studentValue <= requiredValue) {
          electivesMetCount++;
          details.push(`✓ ${elective.subject}: ${studentGrade} (meets requirement)`);
        } else {
          details.push(`❌ ${elective.subject}: ${studentGrade} (requires ${elective.min_grade} or better)`);
          recommendations.push(`Improve ${elective.subject} grade to ${elective.min_grade} or better`);
        }
      }
    }
  }

  // Check aggregate if specified
  if (requirement.aggregatePoints) {
    const studentAggregate = calculateAggregate(grades);
    if (studentAggregate <= requirement.aggregatePoints) {
      details.push(`✓ Aggregate: ${studentAggregate} points (within limit)`);
    } else {
      eligible = false;
      details.push(`❌ Aggregate: ${studentAggregate} points (exceeds ${requirement.aggregatePoints})`);
      recommendations.push(`Improve overall grades to reduce aggregate points`);
    }
  }

  // Determine final status
  let status: EligibilityResult['status'];
  let message: string;

  if (eligible && electivesMetCount >= requirement.electiveSubjects.length) {
    status = borderline ? 'borderline' : 'eligible';
    message = borderline 
      ? 'Borderline - Consider improving one grade'
      : 'Fully Eligible - All requirements met';
  } else {
    status = 'not_eligible';
    message = 'Not Eligible - Requirements not met';
  }

  return {
    programId: requirement.programId,
    programName: requirement.programName,
    universityName: requirement.universityName,
    status,
    message,
    details,
    recommendations: recommendations.length > 0 ? recommendations : undefined
  };
}

function calculateAggregate(grades: WassceeGrades): number {
  const gradesList = Object.values(grades).filter(Boolean) as string[];
  const bestSixGrades = gradesList
    .map(grade => gradeValues[grade])
    .sort((a, b) => a - b)
    .slice(0, 6);
  
  return bestSixGrades.reduce((sum, value) => sum + value, 0);
}
