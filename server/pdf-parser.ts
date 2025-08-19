import pdfParse from 'pdf-parse';
import { storage } from './storage';
import type { InsertProgram, InsertRequirement } from '@shared/schema';

export interface ParsedProgramRequirement {
  programName: string;
  faculty?: string;
  level: string;
  coreSubjects: Record<string, string>;
  electiveSubjects: Array<{
    subject: string;
    min_grade: string;
    options?: string[];
    requirements?: string;
  }>;
  additionalRequirements?: string;
  applicantType: string; // "WASSCE/SSSCE", "WASSCE", "SSSCE"
}

export interface ParsedUniversityData {
  universityName: string;
  programs: ParsedProgramRequirement[];
  generalRequirements?: {
    coreSubjects: Record<string, string>;
    minimumAggregate?: number;
    additionalInfo?: string;
  };
}

export class PDFRequirementsParser {
  
  /**
   * Extract text content from PDF buffer
   */
  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${(error as Error).message}`);
    }
  }

  /**
   * Parse admission requirements from PDF text
   */
  parseAdmissionRequirements(text: string): ParsedUniversityData {
    // Clean the text and split into meaningful chunks
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Debug logging removed for cleaner output
    
    const programs: ParsedProgramRequirement[] = [];
    let currentFaculty = '';
    let currentSection = '';
    let universityName = 'KNUST'; // Default to KNUST since we know this is KNUST document
    
    // Extract university name from text
    const universityMatch = text.match(/Kwame Nkrumah University of Science and Technology|University of Ghana|University of Cape Coast|Ashesi University/i);
    if (universityMatch) {
      universityName = universityMatch[0];
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect faculty sections
      if (line.includes('Faculty of') || line.includes('College of')) {
        currentFaculty = line.replace(/^\d+\s*/, '').trim();

        continue;
      }
      
      // Detect WASSCE/SSSCE applicant sections
      if (line.match(/A\.\s*(WASSCE|SSSCE|WASSCE\/SSSCE|SSSCE\/WASSCE)\s*APPLICANTS?/i)) {
        currentSection = line.trim();

        continue;
      }
      
      // Look for program groups - when we find the first program, collect all subsequent programs until "Entry Requirements"
      const programMatch = line.match(/^\d+\)\s*(.+)/);
      if (programMatch && currentSection.includes('WASSCE')) {
        // Collect all programs in this group
        const programGroup: string[] = [];
        let currentLine = i;
        
        // First program
        programGroup.push(programMatch[1].trim());
        currentLine++;
        
        // Look for more programs before Entry Requirements
        while (currentLine < lines.length) {
          const nextLine = lines[currentLine];
          
          if (nextLine.includes('Entry Requirements')) {
            break;
          }
          
          const nextProgramMatch = nextLine.match(/^\d+\)\s*(.+)/);
          if (nextProgramMatch) {
            programGroup.push(nextProgramMatch[1].trim());
          }
          
          currentLine++;
        }
        
        // Now extract requirements starting from where we found "Entry Requirements"
        if (currentLine < lines.length && lines[currentLine].includes('Entry Requirements')) {
          const requirements = this.extractRequirementsFromLines(lines, currentLine + 1);
          
          if (requirements) {
            const applicantType = this.extractApplicantType(currentSection);
            
            // Create an entry for each program in the group with the same requirements
            for (const programName of programGroup) {
              programs.push({
                programName,
                faculty: currentFaculty,
                level: this.extractLevel(programName),
                coreSubjects: requirements.coreSubjects,
                electiveSubjects: requirements.electiveSubjects,
                additionalRequirements: requirements.additionalRequirements,
                applicantType
              });
            }
            

          }
        }
        
        // Skip ahead to avoid reprocessing
        i = currentLine + 10; // Skip ahead to avoid duplicate processing
      }
    }
    
    return {
      universityName,
      programs,
      generalRequirements: this.extractGeneralRequirements(text)
    };
  }

  /**
   * Extract requirements starting from a specific line (after "Entry Requirements")
   */
  private extractRequirementsFromLines(lines: string[], startIndex: number): {
    coreSubjects: Record<string, string>;
    electiveSubjects: Array<{subject: string, min_grade: string, options?: string[], requirements?: string}>;
    additionalRequirements?: string;
  } | null {
    
    let coreSubjects: Record<string, string> = {};
    let electiveSubjects: Array<{subject: string, min_grade: string, options?: string[], requirements?: string}> = [];
    let additionalRequirements = '';
    

    
    for (let i = startIndex; i < Math.min(startIndex + 20, lines.length); i++) {
      const line = lines[i];
      
      // Stop if we hit a new major section
      if (line.match(/^[A-Z]\.\s*[A-Z]/) || line.match(/^\d+\)\s*BSC|^\d+\)\s*BACHELOR/) || line.includes('Faculty of')) {

        break;
      }
      
      // Parse core subjects
      if (line.includes('Core Subjects:')) {
        let coreText = line.replace('Core Subjects:', '').trim();
        
        // Look ahead for continuation - subjects might be on next lines
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.includes('Elective Subjects') || nextLine.match(/^\d+\)\s*/) || nextLine.match(/^[A-Z]\.\s*/)) break;
          if (nextLine.trim() && !nextLine.includes(':')) {
            coreText += ' ' + nextLine.trim();
          }
        }
        

        
        // Extract subjects
        if (coreText.toLowerCase().includes('english')) coreSubjects['English Language'] = 'C6';
        if (coreText.toLowerCase().includes('mathema') || coreText.toLowerCase().includes('mathematics')) coreSubjects['Mathematics'] = 'C6';
        if (coreText.toLowerCase().includes('integrated science') || coreText.toLowerCase().includes('science')) coreSubjects['Integrated Science'] = 'C6';
      }
      
      // Parse elective subjects
      if (line.includes('Elective Subjects:')) {
        let electiveText = line.replace('Elective Subjects:', '').trim();
        
        // Look ahead for all elective requirements
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const nextLine = lines[j];
          
          // Stop at next major section
          if (nextLine.match(/^[A-Z]\.\s*/) || nextLine.match(/^\d+\)\s*BSC/) || nextLine.includes('Faculty of')) break;
          
          // Add continuation text
          if (nextLine.trim() && !nextLine.includes(':')) {
            electiveText += ' ' + nextLine.trim();
          }
        }
        
        // Parse elective subjects from the complete text
        const subjects = this.extractSubjectsFromText(electiveText);
        
        subjects.forEach(subject => {
          electiveSubjects.push({
            subject,
            min_grade: 'C6'
          });
        });
        
        // Also add the full text as additional requirements
        additionalRequirements = electiveText;
      }
    }
    

    
    if (Object.keys(coreSubjects).length > 0 || electiveSubjects.length > 0) {
      return {
        coreSubjects,
        electiveSubjects,
        additionalRequirements: additionalRequirements.trim() || undefined
      };
    }
    
    return null;
  }

  /**
   * Extract subject names from requirement text
   */
  private extractSubjectsFromText(text: string): string[] {
    const subjects: string[] = [];
    
    // Common subject patterns
    const subjectPatterns = [
      'English Language',
      'Mathematics',
      'Integrated Science',
      'Chemistry',
      'Physics',
      'Biology',
      'General Agriculture',
      'Economics',
      'Geography',
      'Technical Drawing',
      'Elective Mathematics',
      'Additional Mathematics',
      'Crop Husbandry',
      'Animal Husbandry',
      'Horticulture',
      'General Knowledge in Art',
      'Graphic Design',
      'Picture Making',
      'Building Construction',
      'Woodwork',
      'Metalwork',
      'Engineering Science',
      'Government',
      'History',
      'Business Management',
      'Accounting',
      'Business Mathematics',
      'Costing'
    ];
    
    for (const subject of subjectPatterns) {
      if (text.toLowerCase().includes(subject.toLowerCase())) {
        subjects.push(subject);
      }
    }
    
    return subjects;
  }

  /**
   * Extract applicant type from section header
   */
  private extractApplicantType(sectionHeader: string): string {
    if (sectionHeader.includes('WASSCE/SSSCE')) return 'WASSCE/SSSCE';
    if (sectionHeader.includes('SSSCE/WASSCE')) return 'SSSCE/WASSCE';
    if (sectionHeader.includes('WASSCE')) return 'WASSCE';
    if (sectionHeader.includes('SSSCE')) return 'SSSCE';
    return 'WASSCE/SSSCE'; // Default
  }

  /**
   * Extract program level from program name
   */
  private extractLevel(programName: string): string {
    if (programName.toLowerCase().includes('bsc') || programName.toLowerCase().includes('bachelor')) {
      return "Bachelor's";
    }
    if (programName.toLowerCase().includes('msc') || programName.toLowerCase().includes('master')) {
      return "Master's";
    }
    if (programName.toLowerCase().includes('phd') || programName.toLowerCase().includes('doctor')) {
      return "Doctorate";
    }
    if (programName.toLowerCase().includes('diploma')) {
      return "Diploma";
    }
    if (programName.toLowerCase().includes('certificate')) {
      return "Certificate";
    }
    return "Bachelor's"; // Default
  }

  /**
   * Extract general university requirements
   */
  private extractGeneralRequirements(text: string): {
    coreSubjects: Record<string, string>;
    minimumAggregate?: number;
    additionalInfo?: string;
  } | undefined {
    
    // Look for general admission requirements section
    const generalSection = text.match(/3\.0 GENERAL ADMISSION REQUIREMENTS[\s\S]*?(?=4\.0|$)/i);
    if (!generalSection) return undefined;
    
    const sectionText = generalSection[0];
    
    const coreSubjects: Record<string, string> = {};
    let minimumAggregate: number | undefined;
    let additionalInfo = '';
    
    // Extract aggregate requirement
    const aggregateMatch = sectionText.match(/aggregate (\d+) or better/i);
    if (aggregateMatch) {
      minimumAggregate = parseInt(aggregateMatch[1]);
    }
    
    // Extract core subjects
    if (sectionText.includes('THREE WASSCE/SSSCE Core Subjects')) {
      coreSubjects['English Language'] = 'C6';
      coreSubjects['Mathematics'] = 'C6';
      coreSubjects['Integrated Science'] = 'C6';
    }
    
    return {
      coreSubjects,
      minimumAggregate,
      additionalInfo: 'General admission requirements as specified in university guidelines'
    };
  }

  /**
   * Save parsed data to database
   */
  async saveToDatabase(parsedData: ParsedUniversityData): Promise<{
    universityId: string;
    programsCreated: number;
    requirementsCreated: number;
  }> {
    
    // Find or create university
    let university = (await storage.getAllUniversities())
      .find(u => u.name.toLowerCase().includes(parsedData.universityName.toLowerCase()));
    
    if (!university) {
      throw new Error(`University not found: ${parsedData.universityName}. Please ensure the university exists in the database first.`);
    }
    
    let programsCreated = 0;
    let requirementsCreated = 0;
    
    // Process each program
    for (const programData of parsedData.programs) {
      // Check if program already exists
      const existingPrograms = await storage.getProgramsByUniversity(university.id);
      const existingProgram = existingPrograms.find(p => 
        p.name.toLowerCase().includes(programData.programName.toLowerCase()) ||
        programData.programName.toLowerCase().includes(p.name.toLowerCase())
      );
      
      let program;
      if (!existingProgram) {
        // Create new program
        const newProgram: InsertProgram = {
          universityId: university.id,
          name: programData.programName,
          level: programData.level,
          duration: programData.level === "Bachelor's" ? 48 : 24, // Default months
          tuitionLocal: null,
          tuitionInternational: null,
          currency: 'GHS',
          description: programData.faculty ? `Part of ${programData.faculty}` : undefined,
          careerOutcomes: null,
          averageSalary: null,
          employmentRate: null
        };
        
        program = await storage.createProgram(newProgram);
        programsCreated++;
      } else {
        program = existingProgram;
      }
      
      // Create or update requirements
      const requirement: InsertRequirement = {
        programId: program.id,
        coreSubjects: programData.coreSubjects,
        electiveSubjects: programData.electiveSubjects,
        additionalRequirements: programData.additionalRequirements,
        aggregatePoints: null,
        admissionTracks: {
          [programData.applicantType]: {
            coreSubjects: programData.coreSubjects,
            electiveSubjects: programData.electiveSubjects,
            additionalRequirements: programData.additionalRequirements
          }
        },
        specialConditions: null,
        requirementComplexity: 'advanced'
      };
      
      // Check if requirements already exist
      const existingRequirements = await storage.getRequirementsByProgram(program.id);
      if (existingRequirements.length === 0) {
        await storage.createRequirement(requirement);
        requirementsCreated++;
      } else {
        // Update existing requirements with new tracks
        const existing = existingRequirements[0];
        const updatedTracks = {
          ...(existing.admissionTracks as any || {}),
          [programData.applicantType]: {
            coreSubjects: programData.coreSubjects,
            electiveSubjects: programData.electiveSubjects,
            additionalRequirements: programData.additionalRequirements
          }
        };
        
        // Update the requirement (this would need to be implemented in storage)
        console.log(`Would update requirements for program ${program.name} with new track: ${programData.applicantType}`);
      }
    }
    
    return {
      universityId: university.id,
      programsCreated,
      requirementsCreated
    };
  }
}

export const pdfParser = new PDFRequirementsParser();