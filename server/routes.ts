import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFiltersSchema, wassceeGradesSchema, type EligibilityResult, type WassceeGrades } from "@shared/schema";

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
          recommendations: recommendations.length > 0 ? recommendations : undefined
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

  // Get scholarships for a university
  app.get("/api/universities/:id/scholarships", async (req, res) => {
    try {
      const scholarships = await storage.getScholarshipsByUniversity(req.params.id);
      res.json(scholarships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scholarships" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
