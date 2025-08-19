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
  type SearchFilters,
  type ProgramSearchFilters,
  type UserPreferences,
  type ToggleFavorite
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
  
  // Enhanced methods for program-driven eligibility
  searchPrograms(filters: ProgramSearchFilters): Promise<Program[]>;
  getUniversitiesByProgram(programName: string): Promise<University[]>;
  getScholarshipsByProgram(programName: string): Promise<Scholarship[]>;
  
  // User preferences
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
  getUserPreferences(): Promise<UserPreferences>;
  
  // Favorites management
  toggleFavoriteProgram(userId: string, programId: string, action: 'add' | 'remove'): Promise<void>;
  getUserFavoritePrograms(userId: string): Promise<string[]>;
}

class MemStorage implements IStorage {
  private users: Map<string, User>;
  private universities: Map<string, University>;
  private programs: Map<string, Program>;
  private requirements: Map<string, Requirement>;
  private scholarships: Map<string, Scholarship>;
  private userPreferences: UserPreferences;

  constructor() {
    this.users = new Map();
    this.universities = new Map();
    this.programs = new Map();
    this.requirements = new Map();
    this.scholarships = new Map();
    this.userPreferences = {};
    
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
        description: "Ghana's premier university, established in 1948" as string
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

    // Sample Programs with enhanced data
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
        description: "Comprehensive computer science program with industry focus",
        field: "Technology",
        applicationDeadline: "2025-05-31",
        careerOutcomes: ["Software Developer", "Data Scientist", "IT Consultant", "Systems Analyst", "Cybersecurity Specialist"],
        averageSalary: 55000,
        employmentRate: 90
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
        description: "Economics program with policy and development focus",
        field: "Business",
        applicationDeadline: "2025-06-15",
        careerOutcomes: ["Economic Analyst", "Policy Advisor", "Financial Consultant", "Development Officer", "Research Economist"],
        averageSalary: 42000,
        employmentRate: 85
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
        description: "Accredited engineering program with practical training",
        field: "Engineering",
        applicationDeadline: "2025-04-30",
        careerOutcomes: ["Civil Engineer", "Project Manager", "Construction Manager", "Structural Engineer", "Infrastructure Planner"],
        averageSalary: 60000,
        employmentRate: 92
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
        description: "Teacher training program for mathematics education",
        field: "Education",
        applicationDeadline: "2025-07-01",
        careerOutcomes: ["Mathematics Teacher", "Education Officer", "Curriculum Developer", "Educational Consultant", "School Administrator"]
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
        description: "Liberal arts business program with leadership focus",
        field: "Business",
        applicationDeadline: "2025-03-15",
        careerOutcomes: ["Business Manager", "Entrepreneur", "Management Consultant", "Marketing Manager", "Operations Manager"]
      },
      {
        id: "prog-006",
        universityId: "knust-001",
        name: "B.Sc. Computer Engineering",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 14500,
        tuitionInternational: 24500,
        currency: "GHS",
        description: "Hardware and software engineering with embedded systems",
        field: "Technology",
        applicationDeadline: "2025-04-30",
        careerOutcomes: ["Computer Engineer", "Hardware Designer", "Embedded Systems Engineer", "Software Engineer", "Robotics Engineer"]
      },
      {
        id: "prog-007",
        universityId: "ucc-001",
        name: "Diploma in Nursing",
        level: "Diploma",
        duration: 36,
        tuitionLocal: 8000,
        tuitionInternational: 15000,
        currency: "GHS",
        description: "Professional nursing program with clinical practice",
        field: "Health",
        applicationDeadline: "2025-06-30",
        careerOutcomes: ["Registered Nurse", "Community Health Nurse", "Hospital Nurse", "Public Health Officer", "Nursing Supervisor"]
      },
      {
        id: "prog-008",
        universityId: "uds-001",
        name: "B.Sc. Agriculture",
        level: "Bachelor's",
        duration: 48,
        tuitionLocal: 9500,
        tuitionInternational: 16000,
        currency: "GHS",
        description: "Modern agriculture with sustainable farming practices",
        field: "Agriculture",
        applicationDeadline: "2025-08-15",
        careerOutcomes: ["Agricultural Officer", "Farm Manager", "Agricultural Consultant", "Extension Officer", "Agribusiness Manager"]
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
      },
      {
        id: "req-006",
        programId: "prog-006",
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
        additionalRequirements: "Strong background in mathematics and physics required",
        aggregatePoints: 20
      },
      {
        id: "req-007",
        programId: "prog-007",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Biology", "min_grade": "C6"},
          {"subject": "Chemistry", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Medical fitness certificate and interview required",
        aggregatePoints: 24
      },
      {
        id: "req-008",
        programId: "prog-008",
        coreSubjects: {
          "English": "C6",
          "Mathematics": "C6",
          "Integrated Science": "C6",
          "Social Studies": "C6"
        },
        electiveSubjects: [
          {"subject": "Biology", "min_grade": "C6"},
          {"subject": "Chemistry", "min_grade": "C6"},
          {"subject": "Any other elective", "min_grade": "C6"}
        ],
        additionalRequirements: "Interest in sustainable agriculture practices",
        aggregatePoints: 30
      }
    ];

    requirements.forEach(req => this.requirements.set(req.id, req));

    // Enhanced Sample Scholarships
    const scholarships = [
      {
        id: "sch-001",
        universityId: "ug-001",
        name: "UG Merit Scholarship",
        amount: 5000,
        currency: "GHS",
        description: "Merit-based scholarship for academic excellence",
        requirements: "Minimum aggregate of 12 points, leadership experience",
        deadline: "2025-06-30",
        eligibilityPrograms: ["B.Sc. Computer Science", "B.A. Economics"]
      },
      {
        id: "sch-002",
        universityId: "knust-001",
        name: "KNUST Engineering Excellence Award",
        amount: 8000,
        currency: "GHS",
        description: "Scholarship for outstanding engineering students",
        requirements: "Excellent performance in mathematics and physics",
        deadline: "2025-05-15",
        eligibilityPrograms: ["B.Sc. Civil Engineering", "B.Sc. Computer Engineering"]
      },
      {
        id: "sch-003",
        universityId: "ucc-001",
        name: "UCC Teacher Training Support",
        amount: 6000,
        currency: "GHS",
        description: "Support for future educators",
        requirements: "Commitment to teach for 2 years after graduation",
        deadline: "2025-07-15",
        eligibilityPrograms: ["B.Ed. Mathematics", "Diploma in Nursing"]
      },
      {
        id: "sch-004",
        universityId: "ashesi-001",
        name: "Ashesi Leadership Scholarship",
        amount: 20000,
        currency: "GHS",
        description: "Full scholarship for exceptional leaders",
        requirements: "Demonstrated leadership, community service, essay",
        deadline: "2025-02-28",
        eligibilityPrograms: ["B.Sc. Business Administration"]
      },
      {
        id: "sch-005",
        universityId: "uds-001",
        name: "Northern Development Scholarship",
        amount: 4000,
        currency: "GHS",
        description: "Supporting students from northern regions",
        requirements: "Resident of Northern Ghana, financial need",
        deadline: "2025-08-01",
        eligibilityPrograms: ["B.Sc. Agriculture"]
      }
    ];

    scholarships.forEach(sch => this.scholarships.set(sch.id, sch));
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
    const user: User = { 
      ...insertUser, 
      id,
      favoritePrograms: [],
      favoriteUniversities: []
    };
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

  // Enhanced methods for program-driven eligibility
  async searchPrograms(filters: ProgramSearchFilters): Promise<Program[]> {
    let programs = Array.from(this.programs.values());

    if (filters.query) {
      const query = filters.query.toLowerCase();
      programs = programs.filter(program => 
        program.name.toLowerCase().includes(query) ||
        program.description?.toLowerCase().includes(query)
      );
    }

    if (filters.level) {
      programs = programs.filter(program => program.level === filters.level);
    }

    if (filters.field) {
      programs = programs.filter(program => 
        program.description?.toLowerCase().includes(filters.field!.toLowerCase())
      );
    }

    // Filter by region and type using university data
    if (filters.region || filters.type) {
      const validPrograms = [];
      for (const program of programs) {
        const university = this.universities.get(program.universityId);
        if (university) {
          let matches = true;
          if (filters.region && university.region !== filters.region) {
            matches = false;
          }
          if (filters.type && university.type !== filters.type) {
            matches = false;
          }
          if (matches) {
            validPrograms.push(program);
          }
        }
      }
      programs = validPrograms;
    }

    return programs;
  }

  async getUniversitiesByProgram(programName: string): Promise<University[]> {
    const programs = Array.from(this.programs.values()).filter(program =>
      program.name.toLowerCase().includes(programName.toLowerCase())
    );
    
    const universityIds = Array.from(new Set(programs.map(p => p.universityId)));
    return universityIds.map(id => this.universities.get(id)).filter(Boolean) as University[];
  }

  async getScholarshipsByProgram(programName: string): Promise<Scholarship[]> {
    const universities = await this.getUniversitiesByProgram(programName);
    const scholarships = [];
    
    for (const university of universities) {
      const uniScholarships = await this.getScholarshipsByUniversity(university.id);
      scholarships.push(...uniScholarships);
    }
    
    return scholarships;
  }

  // User preferences methods
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  async getUserPreferences(): Promise<UserPreferences> {
    return this.userPreferences;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // University methods
  async getAllUniversities(): Promise<University[]> {
    return await db.select().from(universities);
  }

  async getUniversity(id: string): Promise<University | undefined> {
    const [university] = await db.select().from(universities).where(eq(universities.id, id));
    return university || undefined;
  }

  async searchUniversities(filters: SearchFilters): Promise<University[]> {
    let query = db.select().from(universities);
    
    if (filters.query) {
      query = query.where(ilike(universities.name, `%${filters.query}%`));
    }
    if (filters.region) {
      query = query.where(eq(universities.region, filters.region));
    }
    if (filters.type) {
      query = query.where(eq(universities.type, filters.type));
    }
    
    return await query;
  }

  async createUniversity(university: InsertUniversity): Promise<University> {
    const [created] = await db.insert(universities).values(university).returning();
    return created;
  }

  // Program methods
  async getProgramsByUniversity(universityId: string): Promise<Program[]> {
    return await db.select().from(programs).where(eq(programs.universityId, universityId));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program || undefined;
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [created] = await db.insert(programs).values(program).returning();
    return created;
  }

  // Requirement methods
  async getRequirementsByProgram(programId: string): Promise<Requirement[]> {
    return await db.select().from(requirements).where(eq(requirements.programId, programId));
  }

  async createRequirement(requirement: InsertRequirement): Promise<Requirement> {
    const [created] = await db.insert(requirements).values(requirement).returning();
    return created;
  }

  // Scholarship methods
  async getScholarshipsByUniversity(universityId: string): Promise<Scholarship[]> {
    return await db.select().from(scholarships).where(eq(scholarships.universityId, universityId));
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const [created] = await db.insert(scholarships).values(scholarship).returning();
    return created;
  }

  // Enhanced methods for program-driven eligibility
  async searchPrograms(filters: ProgramSearchFilters): Promise<Program[]> {
    let query = db.select().from(programs);
    
    if (filters.query) {
      query = query.where(ilike(programs.name, `%${filters.query}%`));
    }
    if (filters.level) {
      query = query.where(eq(programs.level, filters.level));
    }
    
    return await query;
  }

  async getUniversitiesByProgram(programName: string): Promise<University[]> {
    const result = await db
      .select({ university: universities })
      .from(universities)
      .innerJoin(programs, eq(programs.universityId, universities.id))
      .where(ilike(programs.name, `%${programName}%`));
    
    return result.map(r => r.university);
  }

  async getScholarshipsByProgram(programName: string): Promise<Scholarship[]> {
    const result = await db
      .select({ scholarship: scholarships })
      .from(scholarships)
      .innerJoin(programs, eq(programs.id, scholarships.programId))
      .where(ilike(programs.name, `%${programName}%`));
    
    return result.map(r => r.scholarship);
  }

  // User preferences
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    // For now, just store in memory since we don't have user authentication
    this.userPreferences = preferences;
  }

  async getUserPreferences(): Promise<UserPreferences> {
    return this.userPreferences || {};
  }

  // Favorites management (simplified for memory storage)
  async toggleFavoriteProgram(userId: string, programId: string, action: 'add' | 'remove'): Promise<void> {
    // For memory storage, just log the action
    console.log(`${action} favorite program ${programId} for user ${userId}`);
  }

  async getUserFavoritePrograms(userId: string): Promise<string[]> {
    const user = this.users.get(userId);
    return (user?.favoritePrograms as string[]) || [];
  }

  private userPreferences: UserPreferences = {};
}

// Using MemStorage with comprehensive sample data for MyCampusMingle platform
// Use in-memory storage with sample data for now  
// Database is automatically seeded on startup in server/index.ts
export const storage: IStorage = new MemStorage();
