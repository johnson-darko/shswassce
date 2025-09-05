import { z } from "zod";

// Core types for offline app
export interface User {
  id: string;
  username: string;
  password: string;
  favoritePrograms?: string[];
  favoriteUniversities?: string[];
}

export interface University {
  id: string;
  name: string;
  location: string;
  region: string;
  type: string; // Public, Private
  size: string; // Small, Medium, Large
  setting: string; // City, Suburban, Rural
  website?: string;
  graduationRate?: number;
  annualCost?: number;
  medianEarnings?: number;
  acceptanceRate?: number;
  description?: string;
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  level: string; // Certificate, Diploma, Bachelor's, Master's
  duration?: number; // months
  tuitionLocal?: number;
  tuitionInternational?: number;
  currency?: string;
  description?: string;
  field?: string;
  applicationDeadline?: string;
  careerOutcomes?: string[];
  averageSalary?: number;
  employmentRate?: number;
}

export interface Requirement {
  id: string;
  programId: string;
  coreSubjects: Record<string, string>; // {"English": "C6", "Mathematics": "C6", ...}
  electiveSubjects: Array<{subject: string, min_grade: string, options?: string[], requirements?: string}>;
  additionalRequirements?: string;
  aggregatePoints?: number;
  // Enhanced fields for complex requirements
  admissionTracks?: Record<string, any>;
  specialConditions?: Record<string, any>;
  requirementComplexity?: string; // basic, intermediate, advanced
}

export interface Scholarship {
  id: string;
  universityId?: string;
  programId?: string;
  name: string;
  amount?: number;
  currency?: string;
  description?: string;
  requirements?: string;
  deadline?: string;
  eligibilityPrograms?: string[];
  eligibilityText?: string;
  link?: string;
}

// Insert types (same as interfaces for offline app)
export type InsertUser = Omit<User, 'id'>;
export type InsertUniversity = Omit<University, 'id'>;
export type InsertProgram = Omit<Program, 'id'>;
export type InsertRequirement = Omit<Requirement, 'id'>;
export type InsertScholarship = Omit<Scholarship, 'id'>;

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
  history: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
  businessManagement: z.string().refine(val => !val || gradeEnum.safeParse(val).success, 'Invalid grade').optional(),
});

export const programSearchFiltersSchema = z.object({
  query: z.string().optional(),
  level: z.string().optional(),
  field: z.string().optional(),
  universityType: z.string().optional(),
  region: z.string().optional(),
  minTuition: z.number().optional(),
  maxTuition: z.number().optional(),
  sortBy: z.enum(['relevance', 'tuition_asc', 'tuition_desc', 'duration', 'employment_rate']).optional(),
});

export const userPreferencesSchema = z.object({
  preferredRegions: z.array(z.string()).optional(),
  maxBudget: z.number().optional(),
  preferredFields: z.array(z.string()).optional(),
  careerGoals: z.array(z.string()).optional(),
  studyMode: z.enum(['full-time', 'part-time', 'both']).optional(),
});

export const toggleFavoriteSchema = z.object({
  programId: z.string(),
  action: z.enum(['add', 'remove'])
});

export const exportRequestSchema = z.object({
  format: z.enum(['csv', 'json']),
  data: z.object({
    results: z.array(z.any()),
    userGrades: z.any(),
    timestamp: z.string()
  })
});

// Export types
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type WassceeGrades = z.infer<typeof wassceeGradesSchema>;
export type ProgramSearchFilters = z.infer<typeof programSearchFiltersSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type ToggleFavorite = z.infer<typeof toggleFavoriteSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;

// Eligibility result types
export interface EligibilityResult {
  programId: string;
  programName: string;
  universityId: string;
  universityName: string;
  status: 'eligible' | 'borderline' | 'not_eligible' | 'multiple_tracks';
  message: string;
  details: string[];
  recommendations?: string[];
  matchScore?: number;
  coreRequirementsMet?: number;
  electiveRequirementsMet?: number;
  aggregateScore?: number;
  tracks?: Array<{
    name: string;
    status: 'eligible' | 'borderline' | 'not_eligible';
    details: string[];
    recommendations?: string[];
  }>;
  // Program details for display
  level?: string;
  duration?: number;
  tuitionLocal?: number;
  tuitionInternational?: number;
  description?: string;
  careerOutcomes?: string[];
  averageSalary?: number;
  employmentRate?: number;
}