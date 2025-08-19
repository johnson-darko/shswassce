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
      
      // Look for individual programs and their requirements
      const programMatch = line.match(/^\d+\)\s*(.+)/);
      if (programMatch && currentSection.includes('WASSCE')) {
        const programName = programMatch[1].trim();
        
        // Look ahead to find this program's requirements
        let requirementStartIndex = -1;
        let nextProgramIndex = -1;
        
        // Find where "Entry Requirements" starts for this program
        for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
          if (lines[j].includes('Entry Requirements')) {
            requirementStartIndex = j + 1;
            break;
          }
        }
        
        // Find where the next program or major section starts to get the boundary
        for (let j = requirementStartIndex + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (nextLine.match(/^\d+\)\s*/) || 
              nextLine.match(/^[A-Z]\.\s*[A-Z]/) || 
              nextLine.includes('Faculty of') ||
              nextLine.includes('College of')) {
            nextProgramIndex = j;
            break;
          }
        }
        
        if (requirementStartIndex > 0) {
          // Ensure we capture enough text for the requirements
          const endIndex = nextProgramIndex > 0 ? nextProgramIndex : Math.min(requirementStartIndex + 40, lines.length);
          const requirements = this.extractDetailedRequirements(lines, requirementStartIndex, endIndex);
          
          if (requirements) {
            const applicantType = this.extractApplicantType(currentSection);
            
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
        
        // Skip ahead slightly to avoid reprocessing
        i += 3;
      }
    }
    
    return {
      universityName,
      programs,
      generalRequirements: this.extractGeneralRequirements(text)
    };
  }

  /**
   * Extract detailed requirements with proper parsing of complex elective patterns
   */
  private extractDetailedRequirements(lines: string[], startIndex: number, endIndex: number): {
    coreSubjects: Record<string, string>;
    electiveSubjects: Array<{subject: string, min_grade: string, options?: string[], requirements?: string}>;
    additionalRequirements?: string;
  } | null {
    
    let coreSubjects: Record<string, string> = {};
    let electiveSubjects: Array<{subject: string, min_grade: string, options?: string[], requirements?: string}> = [];
    let additionalRequirements = '';
    
    const requirementText = lines.slice(startIndex, endIndex).join(' ').trim();
    
    // Check if we have valid requirement text
    if (!requirementText || requirementText.length < 10) {
      return null;
    }
    
    // Parse core subjects
    const coreMatch = requirementText.match(/Core Subjects:\s*(.+?)(?=Elective Subjects:|$)/i);
    if (coreMatch) {
      const coreText = coreMatch[1];
      if (coreText.toLowerCase().includes('english')) coreSubjects['English Language'] = 'C6';
      if (coreText.toLowerCase().includes('mathema') || coreText.toLowerCase().includes('mathematics')) coreSubjects['Mathematics'] = 'C6';
      if (coreText.toLowerCase().includes('integrated science') || coreText.toLowerCase().includes('science')) coreSubjects['Integrated Science'] = 'C6';
    }
    
    // Parse elective subjects with all patterns
    const electiveMatch = requirementText.match(/Elective Subjects:\s*(.+?)(?=For Applicants|Note:|Entry Requirements|Core Subjects:|$)/i);
    if (electiveMatch) {
      const electiveText = electiveMatch[1];
      additionalRequirements = electiveText.trim();
      
      // Remove debug logging
      
      // Pattern 1: Options with i., ii., iii.
      const optionMatches = electiveText.match(/(i{1,3}|iv|v)\.\s*([^.]+?)(?=\s*(i{1,3}|iv|v)\.|$)/g);
      if (optionMatches && optionMatches.length > 1) {
        optionMatches.forEach((option, index) => {
          const optionText = option.replace(/^(i{1,3}|iv|v)\.\s*/, '').trim();
          const subjects = this.extractSubjectsFromText(optionText);
          
          electiveSubjects.push({
            subject: `Option ${index + 1}`,
            min_grade: 'C6',
            options: subjects,
            requirements: optionText
          });
        });
      }
      // Pattern 2: Groupings with • bullet points
      else if (electiveText.includes('•')) {
        const groupMatches = electiveText.match(/•\s*([^•]+)/g);
        if (groupMatches) {
          groupMatches.forEach((group, index) => {
            const groupText = group.replace('•', '').trim();
            const subjects = this.extractSubjectsFromText(groupText);
            
            electiveSubjects.push({
              subject: `Group ${index + 1}`,
              min_grade: 'C6',
              options: subjects,
              requirements: groupText
            });
          });
        }
      }
      // Pattern 3: a), b), c) groupings
      else if (electiveText.match(/[a-z]\)/)) {
        const letterMatches = electiveText.match(/[a-z]\)\s*([^a-z)]+?)(?=\s*[a-z]\)|$)/g);
        if (letterMatches) {
          letterMatches.forEach((group, index) => {
            const groupText = group.replace(/^[a-z]\)\s*/, '').trim();
            const subjects = this.extractSubjectsFromText(groupText);
            
            electiveSubjects.push({
              subject: `Option ${String.fromCharCode(97 + index).toUpperCase()}`,
              min_grade: 'C6',
              options: subjects,
              requirements: groupText
            });
          });
        }
      }
      // Pattern 4: Simple list with "and any TWO (2) from"
      else if (electiveText.includes('and any') || electiveText.includes('any TWO') || electiveText.includes('any THREE')) {
        const subjects = this.extractSubjectsFromText(electiveText);
        subjects.forEach(subject => {
          electiveSubjects.push({
            subject,
            min_grade: 'C6'
          });
        });
      }
      // Pattern 5: Simple "Credit passes in THREE (3) subjects from"
      else if (electiveText.includes('THREE') && electiveText.includes('from')) {
        const subjects = this.extractSubjectsFromText(electiveText);
        electiveSubjects.push({
          subject: 'Any three subjects from list',
          min_grade: 'C6',
          options: subjects,
          requirements: 'Credit passes in THREE (3) subjects from the following list'
        });
      }
      // Pattern 6: Default - extract all subjects
      else {
        const subjects = this.extractSubjectsFromText(electiveText);
        subjects.forEach(subject => {
          electiveSubjects.push({
            subject,
            min_grade: 'C6'
          });
        });
      }
    }
    
    if (Object.keys(coreSubjects).length > 0 || electiveSubjects.length > 0) {
      return {
        coreSubjects,
        electiveSubjects,
        additionalRequirements: additionalRequirements || undefined
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