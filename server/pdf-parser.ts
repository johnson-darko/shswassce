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
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const programs: ParsedProgramRequirement[] = [];
    let currentFaculty = '';
    let currentSection = '';
    let universityName = 'Unknown University';
    
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
      
      // Detect program entries (numbered lists like "1) BSC. COMPUTER SCIENCE")
      const programMatch = line.match(/^\d+\)\s*(.+)/);
      if (programMatch && currentSection.includes('WASSCE')) {
        
        // Extract requirements for this program group (might include multiple programs)
        const programGroup = this.extractRequirementsForPrograms(lines, i);
        
        if (programGroup) {
          const applicantType = this.extractApplicantType(currentSection);
          
          // Create a program entry for each program in the group
          for (const programName of programGroup.programs) {
            programs.push({
              programName,
              faculty: currentFaculty,
              level: this.extractLevel(programName),
              coreSubjects: programGroup.requirements.coreSubjects,
              electiveSubjects: programGroup.requirements.electiveSubjects,
              additionalRequirements: programGroup.requirements.additionalRequirements,
              applicantType
            });
          }
        }
        
        // Skip ahead to avoid reprocessing the same program group
        const skipLines = programGroup?.programs.length || 1;
        i += skipLines * 3; // Rough estimate to skip processed content
      }
    }
    
    return {
      universityName,
      programs,
      generalRequirements: this.extractGeneralRequirements(text)
    };
  }

  /**
   * Extract requirements for multiple programs that share the same requirements
   */
  private extractRequirementsForPrograms(lines: string[], startIndex: number): {
    programs: string[];
    requirements: {
      coreSubjects: Record<string, string>;
      electiveSubjects: Array<{subject: string, min_grade: string, options?: string[], requirements?: string}>;
      additionalRequirements?: string;
    };
  } | null {
    
    const programs: string[] = [];
    let coreSubjects: Record<string, string> = {};
    let electiveSubjects: Array<{subject: string, min_grade: string, options?: string[], requirements?: string}> = [];
    let additionalRequirements = '';
    
    let foundEntryReqs = false;
    let currentProgramSection = true;
    
    // First, collect all programs until we hit "Entry Requirements"
    for (let i = startIndex; i < Math.min(startIndex + 30, lines.length); i++) {
      const line = lines[i];
      
      if (line.includes('Entry Requirements')) {
        foundEntryReqs = true;
        currentProgramSection = false;
        continue;
      }
      
      // Collect program names while in program section
      if (currentProgramSection) {
        const programMatch = line.match(/^\d+\)\s*(.+)/);
        if (programMatch) {
          programs.push(programMatch[1].trim());
        }
        // Also check for programs that might be on continuation lines
        else if (line.match(/^[A-Z][A-Z\s]+/) && !line.includes('Entry Requirements') && !line.includes('Core Subjects') && !line.includes('Elective Subjects')) {
          // This might be a program name that continues from previous line
          const lastProgram = programs[programs.length - 1];
          if (lastProgram && lastProgram.length < 50) {
            programs[programs.length - 1] = lastProgram + ' ' + line.trim();
          }
        }
        continue;
      }
      
      // Stop if we hit a new section (like B. GCE 'A'LEVEL APPLICANTS)
      if (line.match(/^[A-Z]\.\s*[A-Z]/) && foundEntryReqs) {
        break;
      }
      
      if (!foundEntryReqs) continue;
      
      // Parse core subjects - look for complete text across multiple lines
      if (line.includes('Core Subjects:') || line.startsWith('Core Subjects')) {
        let coreText = line.replace(/Core Subjects:?/g, '').trim();
        
        // Look ahead for continuation lines
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.includes('Elective Subjects') || nextLine.match(/^\d+\)\s*/)) break;
          if (nextLine.trim() && !nextLine.includes('Entry Requirements')) {
            coreText += ' ' + nextLine.trim();
          }
        }
        
        if (coreText.includes('Credit passes in') || coreText.includes('English Language')) {
          const subjects = this.extractSubjectsFromText(coreText);
          subjects.forEach(subject => {
            coreSubjects[subject] = 'C6'; // Default credit requirement
          });
        }
      }
      
      // Parse elective subjects with complete text
      if (line.includes('Elective Subjects:') || line.startsWith('Elective Subjects')) {
        let electiveText = line.replace(/Elective Subjects:?/g, '').trim();
        
        // Look ahead for continuation lines and options
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const nextLine = lines[j];
          
          // Stop at next major section
          if (nextLine.match(/^[A-Z]\.\s*[A-Z]/) || nextLine.match(/^\d+\)\s*BSC|^\d+\)\s*BACHELOR/)) break;
          
          if (nextLine.trim()) {
            // Check for option groups (i., ii., iii.)
            if (nextLine.match(/^\s*(i{1,3}|iv|v)\./)) {
              const optionText = nextLine.replace(/^\s*(i{1,3}|iv|v)\./, '').trim();
              
              // Look for continuation of this option
              let completeOptionText = optionText;
              for (let k = j + 1; k < Math.min(j + 5, lines.length); k++) {
                const contLine = lines[k];
                if (contLine.match(/^\s*(i{1,3}|iv|v)\./) || contLine.match(/^[A-Z]\.\s*/)) break;
                if (contLine.trim() && !contLine.includes(':')) {
                  completeOptionText += ' ' + contLine.trim();
                }
              }
              
              const optionSubjects = this.extractSubjectsFromText(completeOptionText);
              
              electiveSubjects.push({
                subject: `Option ${nextLine.match(/^\s*(i{1,3}|iv|v)/)?.[1] || 'Group'}`,
                min_grade: 'C6',
                options: optionSubjects,
                requirements: completeOptionText
              });
            }
            // Regular elective text continuation
            else if (!nextLine.includes(':') && !nextLine.match(/^\d+\)\s*/)) {
              electiveText += ' ' + nextLine.trim();
            }
          }
        }
        
        // Handle simple elective requirements (non-option based)
        if (electiveText.includes('Credit passes in') && !electiveText.includes('following options')) {
          const subjects = this.extractSubjectsFromText(electiveText);
          subjects.forEach(subject => {
            electiveSubjects.push({
              subject,
              min_grade: 'C6'
            });
          });
        }
      }
      
      // Collect additional requirements
      if (foundEntryReqs && !line.includes('Core Subjects:') && !line.includes('Elective Subjects:') && !line.match(/^\s*(i{1,3}|iv|v)\./)) {
        if (line.length > 10 && line.trim()) {
          additionalRequirements += line.trim() + ' ';
        }
      }
    }
    
    if (programs.length > 0 && (Object.keys(coreSubjects).length > 0 || electiveSubjects.length > 0)) {
      return {
        programs,
        requirements: {
          coreSubjects,
          electiveSubjects,
          additionalRequirements: additionalRequirements.trim() || undefined
        }
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