import { 
  type User, 
  type InsertUser, 
  type University, 
  type InsertUniversity,
  type Program,
  type InsertProgram,
  type Requirement,
  type InsertRequirement,
  type Scholarship,
  type InsertScholarship,
  type SearchFilters
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // University methods
  getAllUniversities(): Promise<University[]>;
  getUniversity(id: string): Promise<University | undefined>;
  searchUniversities(filters: SearchFilters): Promise<University[]>;
  createUniversity(university: InsertUniversity): Promise<University>;
  
  // Program methods
  getProgramsByUniversity(universityId: string): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  // Requirement methods
  getRequirementsByProgram(programId: string): Promise<Requirement[]>;
  createRequirement(requirement: InsertRequirement): Promise<Requirement>;
  
  // Scholarship methods
  getScholarshipsByUniversity(universityId: string): Promise<Scholarship[]>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private universities: Map<string, University>;
  private programs: Map<string, Program>;
  private requirements: Map<string, Requirement>;
  private scholarships: Map<string, Scholarship>;

  constructor() {
    this.users = new Map();
    this.universities = new Map();
    this.programs = new Map();
    this.requirements = new Map();
    this.scholarships = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample Universities
    const universities = [
      {
        id: "ug-001",
        name: "University of Ghana",
        location: "Accra",
        region: "Greater Accra",
        type: "Public",
        size: "Large",
        setting: "City",
        website: "https://ug.edu.gh",
        graduationRate: 87,
        annualCost: 15000,
        medianEarnings: 45000,
        acceptanceRate: 65,
        description: "Ghana's premier university, established in 1948"
      },
      {
        id: "knust-001",
        name: "Kwame Nkrumah University of Science and Technology",
        location: "Kumasi",
        region: "Ashanti",
        type: "Public",
        size: "Large",
        setting: "City",
        website: "https://knust.edu.gh",
        graduationRate: 82,
        annualCost: 12500,
        medianEarnings: 52000,
        acceptanceRate: 58,
        description: "Leading technology and science university in Ghana"
      },
      {
        id: "ucc-001",
        name: "University of Cape Coast",
        location: "Cape Coast",
        region: "Central",
        type: "Public",
        size: "Medium",
        setting: "City",
        website: "https://ucc.edu.gh",
        graduationRate: 79,
        annualCost: 11000,
        medianEarnings: 38000,
        acceptanceRate: 72,
        description: "Ghana's premier university for education and liberal arts"
      },
      {
        id: "ashesi-001",
        name: "Ashesi University",
        location: "Berekuso",
        region: "Eastern",
        type: "Private",
        size: "Small",
        setting: "Suburban",
        website: "https://ashesi.edu.gh",
        graduationRate: 95,
        annualCost: 45000,
        medianEarnings: 75000,
        acceptanceRate: 35,
        description: "Liberal arts university focused on leadership and innovation"
      },
      {
        id: "uds-001",
        name: "University for Development Studies",
        location: "Tamale",
        region: "Northern",
        type: "Public",
        size: "Medium",
        setting: "City",
        website: "https://uds.edu.gh",
        graduationRate: 75,
        annualCost: 9500,
        medianEarnings: 35000,
        acceptanceRate: 68,
        description: "Multi-campus university focused on development studies"
      }
    ];

    universities.forEach(uni => this.universities.set(uni.id, uni));

    // Sample Programs
    const programs = [
      {
        id: "prog-001",
        universityId: "ug-001",
        name: "B.Sc. Computer Science",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 15000,
        tuitionInternational: 25000,
        currency: "GHS",
        description: "Comprehensive computer science program with industry focus"
      },
      {
        id: "prog-002",
        universityId: "ug-001",
        name: "B.A. Economics",
        level: "Bachelor's",
        duration: 36,
        tuitionLocal: 12000,
        tuitionInternational: 20000,
        currency: "GHS",
        description: "Economics program with policy and development focus"
      },
      {
        id: "prog-003",
        universityId: "knust-001",
        name: "B.Sc. Civil Engineering",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 14000,
        tuitionInternational: 24000,
        currency: "GHS",
        description: "Accredited engineering program with practical training"
      },
      {
        id: "prog-004",
        universityId: "ucc-001",
        name: "B.Ed. Mathematics",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 11000,
        tuitionInternational: 18000,
        currency: "GHS",
        description: "Teacher training program for mathematics education"
      },
      {
        id: "prog-005",
        universityId: "ashesi-001",
        name: "B.Sc. Business Administration",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 45000,
        tuitionInternational: 45000,
        currency: "GHS",
        description: "Liberal arts business program with leadership focus"
      }
    ];

    programs.forEach(prog => this.programs.set(prog.id, prog));

    // Sample Requirements
    const requirements = [
      {
        id: "req-001",
        programId: "prog-001",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Elective Mathematics", "min_grade": "B3"},
          {"subject": "Physics", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Strong performance in mathematics required",
        aggregatePoints: 24
      },
      {
        id: "req-002",
        programId: "prog-002",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Economics", "min_grade": "C6"},
          {"subject": "Government", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Good performance in social sciences preferred",
        aggregatePoints: 24
      },
      {
        id: "req-003",
        programId: "prog-003",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Elective Mathematics", "min_grade": "B3"},
          {"subject": "Physics", "min_grade": "B3"},
          {"subject": "Chemistry", "min_grade": "C6"}
        ],
        additionalRequirements: "Must have strong mathematics and physics background",
        aggregatePoints: 20
      },
      {
        id: "req-004",
        programId: "prog-004",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Elective Mathematics", "min_grade": "C6"},
          {"subject": "Any other 2 electives", "min_grade": "C6"}
        ],
        additionalRequirements: "Teaching aptitude test required",
        aggregatePoints: 24
      },
      {
        id: "req-005",
        programId: "prog-005",
        coreSubjects: {
          "English": "B3",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Economics", "min_grade": "B3"},
          {"subject": "Any other 2 electives", "min_grade": "C6"}
        ],
        additionalRequirements: "Interview and essay required for admission",
        aggregatePoints: 18
      }
    ];

    requirements.forEach(req => this.requirements.set(req.id, req));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // University methods
  async getAllUniversities(): Promise<University[]> {
    return Array.from(this.universities.values());
  }

  async getUniversity(id: string): Promise<University | undefined> {
    return this.universities.get(id);
  }

  async searchUniversities(filters: SearchFilters): Promise<University[]> {
    let universities = Array.from(this.universities.values());

    if (filters.query) {
      const query = filters.query.toLowerCase();
      universities = universities.filter(uni => 
        uni.name.toLowerCase().includes(query) ||
        uni.location.toLowerCase().includes(query) ||
        uni.description?.toLowerCase().includes(query)
      );
    }

    if (filters.region) {
      universities = universities.filter(uni => uni.region === filters.region);
    }

    if (filters.type) {
      universities = universities.filter(uni => uni.type === filters.type);
    }

    if (filters.minCost) {
      universities = universities.filter(uni => 
        uni.annualCost ? uni.annualCost >= filters.minCost! : true
      );
    }

    if (filters.maxCost) {
      universities = universities.filter(uni => 
        uni.annualCost ? uni.annualCost <= filters.maxCost! : true
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'cost_asc':
          universities.sort((a, b) => (a.annualCost || 0) - (b.annualCost || 0));
          break;
        case 'cost_desc':
          universities.sort((a, b) => (b.annualCost || 0) - (a.annualCost || 0));
          break;
        case 'graduation_rate':
          universities.sort((a, b) => (b.graduationRate || 0) - (a.graduationRate || 0));
          break;
        case 'acceptance_rate':
          universities.sort((a, b) => (a.acceptanceRate || 100) - (b.acceptanceRate || 100));
          break;
      }
    }

    return universities;
  }

  async createUniversity(university: InsertUniversity): Promise<University> {
    const id = randomUUID();
    const newUniversity: University = { ...university, id };
    this.universities.set(id, newUniversity);
    return newUniversity;
  }

  // Program methods
  async getProgramsByUniversity(universityId: string): Promise<Program[]> {
    return Array.from(this.programs.values()).filter(
      program => program.universityId === universityId
    );
  }

  async getProgram(id: string): Promise<Program | undefined> {
    return this.programs.get(id);
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const id = randomUUID();
    const newProgram: Program = { ...program, id };
    this.programs.set(id, newProgram);
    return newProgram;
  }

  // Requirement methods
  async getRequirementsByProgram(programId: string): Promise<Requirement[]> {
    return Array.from(this.requirements.values()).filter(
      req => req.programId === programId
    );
  }

  async createRequirement(requirement: InsertRequirement): Promise<Requirement> {
    const id = randomUUID();
    const newRequirement: Requirement = { ...requirement, id };
    this.requirements.set(id, newRequirement);
    return newRequirement;
  }

  // Scholarship methods
  async getScholarshipsByUniversity(universityId: string): Promise<Scholarship[]> {
    return Array.from(this.scholarships.values()).filter(
      scholarship => scholarship.universityId === universityId
    );
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const id = randomUUID();
    const newScholarship: Scholarship = { ...scholarship, id };
    this.scholarships.set(id, newScholarship);
    return newScholarship;
  }
}

export const storage = new MemStorage();
