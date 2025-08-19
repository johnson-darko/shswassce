import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  favoritePrograms: jsonb("favorite_programs").default([]), // Array of program IDs
  favoriteUniversities: jsonb("favorite_universities").default([]), // Array of university IDs
});

export const universities = pgTable("universities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  region: text("region").notNull(),
  type: text("type").notNull(), // Public, Private
  size: text("size").notNull(), // Small, Medium, Large
  setting: text("setting").notNull(), // City, Suburban, Rural
  website: text("website"),
  graduationRate: integer("graduation_rate"),
  annualCost: integer("annual_cost"),
  medianEarnings: integer("median_earnings"),
  acceptanceRate: integer("acceptance_rate"),
  description: text("description"),
});

export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  universityId: varchar("university_id").notNull().references(() => universities.id),
  name: text("name").notNull(),
  level: text("level").notNull(), // Certificate, Diploma, Bachelor's, Master's
  duration: integer("duration_months"),
  tuitionLocal: integer("tuition_local"),
  tuitionInternational: integer("tuition_international"),
  currency: text("currency").default("GHS"),
  description: text("description"),
  careerOutcomes: jsonb("career_outcomes"), // Array of typical jobs/fields
  averageSalary: integer("average_salary"),
  employmentRate: integer("employment_rate"), // Percentage
});

export const requirements = pgTable("requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull().references(() => programs.id),
  coreSubjects: jsonb("core_subjects").notNull(), // {"English": "C6", "Mathematics": "C6", ...}
  electiveSubjects: jsonb("elective_subjects").notNull(), // [{"subject": "Elective Mathematics", "min_grade": "B3"}, ...]
  additionalRequirements: text("additional_requirements"),
  aggregatePoints: integer("aggregate_points"), // Maximum aggregate score if applicable
  // Enhanced fields for complex requirements
  admissionTracks: jsonb("admission_tracks"), // Multiple pathway options for programs like KNUST
  specialConditions: jsonb("special_conditions"), // Age, experience, portfolio requirements
  requirementComplexity: text("requirement_complexity").default("basic"), // basic, intermediate, advanced
});

export const scholarships = pgTable("scholarships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  universityId: varchar("university_id").references(() => universities.id),
  programId: varchar("program_id").references(() => programs.id),
  name: text("name").notNull(),
  amount: integer("amount"),
  eligibilityText: text("eligibility_text"),
  link: text("link"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUniversitySchema = createInsertSchema(universities).omit({
  id: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
});

export const insertRequirementSchema = createInsertSchema(requirements).omit({
  id: true,
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type University = typeof universities.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Requirement = typeof requirements.$inferSelect;
export type Scholarship = typeof scholarships.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUniversity = z.infer<typeof insertUniversitySchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;

// Additional types for API
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  region: z.string().optional(),
  type: z.string().optional(),
  level: z.string().optional(),
  minCost: z.number().optional(),
  maxCost: z.number().optional(),
  sortBy: z.enum(['relevance', 'cost_asc', 'cost_desc', 'graduation_rate', 'acceptance_rate']).optional(),
});

const gradeEnum = z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']);

export const wassceeGradesSchema = z.object({
  english: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  mathematics: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  science: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  social: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  electiveMath: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  physics: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  chemistry: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  biology: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  economics: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  government: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  literature: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  geography: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type WassceeGrades = z.infer<typeof wassceeGradesSchema>;

export interface EligibilityResult {
  programId: string;
  programName: string;
  universityName: string;
  status: 'eligible' | 'borderline' | 'not_eligible' | 'multiple_tracks';
  message: string;
  details: string[];
  recommendations?: string[];
  matchScore?: number; // For sorting by best match
  careerOutcomes?: string[]; // Typical jobs/fields for graduates
  averageSalary?: number;
  employmentRate?: number;
  isFavorite?: boolean; // Whether user has saved this program
  // Enhanced fields for complex eligibility
  admissionTracks?: AdmissionTrack[]; // Available tracks for complex programs
  bestTrackMatch?: string; // Which track best fits the student's grades
  requirementComplexity?: 'basic' | 'intermediate' | 'advanced';
}

export interface AdmissionTrack {
  name: string;
  description: string;
  electiveOptions: ElectiveOption[];
  additionalRequirements?: string[];
  status: 'eligible' | 'borderline' | 'not_eligible';
  matchDetails: string[];
}

export interface ElectiveOption {
  name: string; // e.g., "Science Track", "Business Track", "General Arts"
  subjects: string[]; // Required subjects for this track
  minGrades: Record<string, string>; // Specific grade requirements per subject
  additionalRules?: string[]; // Special conditions like "Must have B3 in Integrated Science"
}

export const programSearchFiltersSchema = z.object({
  query: z.string().optional(),
  level: z.string().optional(),
  region: z.string().optional(),
  type: z.string().optional(),
  field: z.string().optional(),
});

export type ProgramSearchFilters = z.infer<typeof programSearchFiltersSchema>;

// User preferences and saved data
export const userPreferencesSchema = z.object({
  grades: wassceeGradesSchema.optional(),
  favoritePrograms: z.array(z.string()).optional(),
  favoriteUniversities: z.array(z.string()).optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Enhanced program with deadline and career info
export const programWithDetailsSchema = z.object({
  id: z.string(),
  universityId: z.string(),
  name: z.string(),
  level: z.string(),
  duration: z.number().optional(),
  tuitionLocal: z.number().optional(),
  tuitionInternational: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  field: z.string().optional(),
  applicationDeadline: z.string().optional(),
  careerOutcomes: z.array(z.string()).optional(),
  universityName: z.string().optional(),
  universityType: z.string().optional(),
  universityRegion: z.string().optional(),
});

export type ProgramWithDetails = z.infer<typeof programWithDetailsSchema>;

// Favorites management
export const toggleFavoriteSchema = z.object({
  programId: z.string(),
  action: z.enum(['add', 'remove']),
});

export type ToggleFavorite = z.infer<typeof toggleFavoriteSchema>;

// Export/share schemas
export const exportRequestSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  data: z.object({
    results: z.array(z.any()), // EligibilityResult array
    userGrades: z.object({}).passthrough(), // WassceeGrades
    timestamp: z.string(),
  }),
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;
