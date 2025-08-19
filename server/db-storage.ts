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
import { db } from "./db";
import { users, universities, programs, requirements, scholarships } from "@shared/schema";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  // University methods
  async getAllUniversities(): Promise<University[]> {
    return await db.select().from(universities);
  }

  async getUniversity(id: string): Promise<University | undefined> {
    const result = await db.select().from(universities).where(eq(universities.id, id)).limit(1);
    return result[0];
  }

  async searchUniversities(filters: SearchFilters): Promise<University[]> {
    let query = db.select().from(universities);
    const conditions = [];

    if (filters.query) {
      conditions.push(
        or(
          ilike(universities.name, `%${filters.query}%`),
          ilike(universities.location, `%${filters.query}%`),
          ilike(universities.description, `%${filters.query}%`)
        )
      );
    }

    if (filters.region) {
      conditions.push(eq(universities.region, filters.region));
    }

    if (filters.type) {
      conditions.push(eq(universities.type, filters.type));
    }

    if (filters.minCost && filters.maxCost) {
      conditions.push(and(
        sql`${universities.annualCost} >= ${filters.minCost}`,
        sql`${universities.annualCost} <= ${filters.maxCost}`
      ));
    } else if (filters.minCost) {
      conditions.push(sql`${universities.annualCost} >= ${filters.minCost}`);
    } else if (filters.maxCost) {
      conditions.push(sql`${universities.annualCost} <= ${filters.maxCost}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'cost_asc':
          query = query.orderBy(universities.annualCost);
          break;
        case 'cost_desc':
          query = query.orderBy(desc(universities.annualCost));
          break;
        case 'graduation_rate':
          query = query.orderBy(desc(universities.graduationRate));
          break;
        case 'acceptance_rate':
          query = query.orderBy(universities.acceptanceRate);
          break;
        default:
          // relevance or default
          break;
      }
    }

    return await query;
  }

  async createUniversity(university: InsertUniversity): Promise<University> {
    const result = await db.insert(universities).values(university).returning();
    return result[0];
  }
  
  // Program methods
  async getProgramsByUniversity(universityId: string): Promise<Program[]> {
    return await db.select().from(programs).where(eq(programs.universityId, universityId));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const result = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
    return result[0];
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const result = await db.insert(programs).values(program).returning();
    return result[0];
  }
  
  // Requirement methods
  async getRequirementsByProgram(programId: string): Promise<Requirement[]> {
    return await db.select().from(requirements).where(eq(requirements.programId, programId));
  }

  async createRequirement(requirement: InsertRequirement): Promise<Requirement> {
    const result = await db.insert(requirements).values(requirement).returning();
    return result[0];
  }
  
  // Scholarship methods
  async getScholarshipsByUniversity(universityId: string): Promise<Scholarship[]> {
    return await db.select().from(scholarships).where(eq(scholarships.universityId, universityId));
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const result = await db.insert(scholarships).values(scholarship).returning();
    return result[0];
  }
  
  // Enhanced methods for program-driven eligibility
  async searchPrograms(filters: ProgramSearchFilters): Promise<Program[]> {
    let query = db.select().from(programs);
    const conditions = [];

    if (filters.query) {
      conditions.push(
        or(
          ilike(programs.name, `%${filters.query}%`),
          ilike(programs.description, `%${filters.query}%`)
        )
      );
    }

    if (filters.level) {
      conditions.push(eq(programs.level, filters.level));
    }

    if (filters.field) {
      // This would need a field column in programs table
      conditions.push(ilike(programs.name, `%${filters.field}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getUniversitiesByProgram(programName: string): Promise<University[]> {
    const result = await db
      .select({
        id: universities.id,
        name: universities.name,
        location: universities.location,
        region: universities.region,
        type: universities.type,
        size: universities.size,
        setting: universities.setting,
        website: universities.website,
        graduationRate: universities.graduationRate,
        annualCost: universities.annualCost,
        medianEarnings: universities.medianEarnings,
        acceptanceRate: universities.acceptanceRate,
        description: universities.description
      })
      .from(universities)
      .innerJoin(programs, eq(programs.universityId, universities.id))
      .where(ilike(programs.name, `%${programName}%`));

    return result;
  }

  async getScholarshipsByProgram(programName: string): Promise<Scholarship[]> {
    const result = await db
      .select({
        id: scholarships.id,
        universityId: scholarships.universityId,
        programId: scholarships.programId,
        name: scholarships.name,
        amount: scholarships.amount,
        eligibilityText: scholarships.eligibilityText,
        link: scholarships.link
      })
      .from(scholarships)
      .innerJoin(programs, eq(programs.id, scholarships.programId))
      .where(ilike(programs.name, `%${programName}%`));

    return result;
  }
  
  // User preferences (simplified for now)
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    // Could be implemented with a user preferences table
    console.log('User preferences saved:', preferences);
  }

  async getUserPreferences(): Promise<UserPreferences> {
    // Return empty for now
    return {};
  }
  
  // Favorites management (simplified for now)
  async toggleFavoriteProgram(userId: string, programId: string, action: 'add' | 'remove'): Promise<void> {
    // Could be implemented by updating user's favoritePrograms jsonb field
    console.log(`${action} favorite program ${programId} for user ${userId}`);
  }

  async getUserFavoritePrograms(userId: string): Promise<string[]> {
    const user = await this.getUser(userId);
    return user?.favoritePrograms as string[] || [];
  }
}