import type { z } from 'zod';
import type { inputSchema, analysisSchema, planSchema, candidateSchema, breakdownSchema, locationMode } from './schemas.js';
export type MentorInput = z.infer<typeof inputSchema>;
export type ProjectAnalysis = z.infer<typeof analysisSchema>;
export type SearchPlan = z.infer<typeof planSchema>;
export type Candidate = z.infer<typeof candidateSchema>;
export type MatchBreakdown = z.infer<typeof breakdownSchema>;
export type LocationImportance = z.infer<typeof locationMode>;
export type Source = {url: string; title: string | null; type: Candidate['evidence'][number]['sourceType']};
export type ContactStatus = 'public_email' | 'official_contact_page' | 'official_profile_only' | 'professional_profile_only' | 'contact_not_found';
export type VerifiedCandidate = Candidate & {verificationStatus: 'verified' | 'partially_verified'; sources: Source[]; contactStatus: ContactStatus};
export type ScoredCandidate = VerifiedCandidate & {matchScore: number; matchBreakdown: MatchBreakdown; locationCompatibility: 'compatible' | 'incompatible' | 'uncertain'};
export type Grounding = {sources: {url: string; title: string | null}[]; searchQueries: string[]; citations: {id: string; url: string; text: string; start: number | null; end: number | null}[]; searchSuggestions: string[]};
export type Research = {text: string; grounding: Grounding};
export interface GeminiClient {
  structured<T>(stage: string, instruction: string, data: unknown, schema: z.ZodType<T>, signal: AbortSignal): Promise<T>;
  research(stage: string, instruction: string, data: unknown, signal: AbortSignal): Promise<Research>;
}
