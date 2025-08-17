import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
});

export const requirements = pgTable("requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull().references(() => programs.id),
  coreSubjects: jsonb("core_subjects").notNull(), // {"English": "C6", "Mathematics": "C6", ...}
  electiveSubjects: jsonb("elective_subjects").notNull(), // [{"subject": "Elective Mathematics", "min_grade": "B3"}, ...]
  additionalRequirements: text("additional_requirements"),
  aggregatePoints: integer("aggregate_points"), // Maximum aggregate score if applicable
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

export const wassceeGradesSchema = z.object({
  english: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  mathematics: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  science: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  social: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  electiveMath: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  physics: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  chemistry: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  biology: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  economics: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  government: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  literature: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
  geography: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']).optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type WassceeGrades = z.infer<typeof wassceeGradesSchema>;

export interface EligibilityResult {
  programId: string;
  programName: string;
  universityName: string;
  status: 'eligible' | 'borderline' | 'not_eligible';
  message: string;
  details: string[];
  recommendations?: string[];
}
