import { z } from 'zod';
import { safeUrl } from '../utils/normalize.js';
const short = z.string().trim().min(1).max(160);
const text = z.string().trim().min(1).max(1500);
const list = z.array(short).max(20);
export const locationMode = z.enum(['none', 'low', 'medium', 'high', 'in_person_required']);
export const inputSchema = z.strictObject({
  projectTitle: z.string().trim().min(1).max(200),
  projectDescription: z.string().trim().min(20).max(6000),
  skills: list.default([]), skillsNeeded: list.default([]), helpNeeded: list.default([]),
  mentorType: short.optional(), researchArea: short.optional(), researchRequired: z.boolean().optional(),
  location: short.optional(), locationImportance: locationMode.default('none'), remoteAllowed: z.boolean().default(true),
  compensation: z.enum(['unpaid', 'paid', 'either']).optional(), competitionContext: short.optional(),
  additionalPreferences: z.string().trim().max(2000).optional(),
}).superRefine((v, ctx) => {
  if ((!v.remoteAllowed || v.locationImportance === 'in_person_required') && !v.location)
    ctx.addIssue({code: 'custom', path: ['location'], message: 'A location is required for in-person matching.'});
});
export const analysisSchema = z.object({
  primaryDomain: short, domains: list, technicalSkills: list, skillsStudentNeeds: list,
  researchAreas: list, industries: list, idealMentorTypes: list, experienceNeeded: list,
  mentorshipGoals: list, importantKeywords: list, searchConcepts: list, researchRequired: z.boolean(),
  locationRequirement: z.object({requestedLocation: short.nullable(), importance: locationMode, remoteAllowed: z.boolean()}),
});
export const sourceType = z.enum(['university', 'research_lab', 'company', 'professional_organization', 'personal_professional_site', 'publication', 'linkedin_public_result', 'other_professional_source']);
export const planSchema = z.object({queries: z.array(z.string().min(5).max(300)).min(5).max(8), preferredSourceTypes: z.array(sourceType).min(1).max(8)});
export const urlSchema = z.string().max(2048).refine(v => safeUrl(v) !== null, 'Invalid public HTTP(S) URL');
export const evidenceSchema = z.object({
  id: short, field: z.enum(['identity', 'role', 'organization', 'location', 'expertise', 'research', 'profile', 'contact', 'email']),
  value: text, sourceUrl: urlSchema, sourceTitle: short.nullable(), sourceType,
  citationId: short, excerptOrSummary: text,
  professionalSource: z.boolean(), currentOrRecent: z.boolean(), explicitlyPublicProfessionalContact: z.boolean(),
});
export const candidateSchema = z.object({
  id: short, name: short, jobTitle: short.nullable(), organization: short.nullable(), location: short.nullable(),
  expertise: list, researchAreas: list, profileUrl: urlSchema.nullable(), contactUrl: urlSchema.nullable(),
  publicEmail: z.email().nullable(), evidence: z.array(evidenceSchema).max(60),
  contradictions: z.array(text).max(10),
});
export const candidatesSchema = z.object({candidates: z.array(candidateSchema).max(15)});
const component = z.object({score: z.number().min(0).max(100), rationale: text, evidenceIds: z.array(short).max(30), matched: list, missing: list});
export const breakdownSchema = z.object({skills: component, research: component, projectRelevance: component, mentorType: component, location: component, preferences: component});
export const evaluationsSchema = z.object({evaluations: z.array(z.object({id: short, breakdown: breakdownSchema, locationCompatibility: z.enum(['compatible', 'incompatible', 'uncertain'])})).max(15)});
// Explanations select supplied statements rather than accepting new factual prose.
export const explanationsSchema = z.object({explanations: z.array(z.object({id: short, statementIds: z.array(short).min(1).max(3)})).max(5)});
