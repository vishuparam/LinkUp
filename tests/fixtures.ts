import { vi } from 'vitest';
import type { z } from 'zod';
import type { Candidate, GeminiClient, Grounding, MatchBreakdown, ProjectAnalysis, Research } from '../src/mentor/types.js';
import { inputSchema } from '../src/mentor/schemas.js';
export const input = inputSchema.parse({projectTitle: 'Retinal image classifier', projectDescription: 'Develop a CNN to detect diabetic retinopathy and design a research experiment.', location: 'Boston, Massachusetts', locationImportance: 'medium'});
export const analysis: ProjectAnalysis = {primaryDomain: 'Medical AI', domains: ['Medical AI'], technicalSkills: ['Deep Learning'], skillsStudentNeeds: ['Retinal imaging'], researchAreas: ['Retinal imaging'], industries: ['Healthcare'], idealMentorTypes: ['Researcher'], experienceNeeded: ['Experimental design'], mentorshipGoals: ['Model evaluation'], importantKeywords: ['Retinal imaging'], searchConcepts: ['Retinal imaging researchers'], researchRequired: true, locationRequirement: {requestedLocation: input.location!, importance: 'medium', remoteAllowed: true}};
export const plan = {queries: ['retinal imaging professor', 'diabetic retinopathy deep learning researcher', 'medical image analysis faculty', 'ophthalmology AI research lab', 'Boston retinal disease scientist'], preferredSourceTypes: ['university']};
export function fixtureCandidate(name = 'Jane Doe', index = 1): {candidate: Candidate; grounding: Grounding} {
  const url = `https://university.edu/faculty/${index}`;
  const fields: [Candidate['evidence'][number]['field'], string][] = [['identity', name], ['role', 'Associate Professor'], ['organization', 'Example University'], ['location', 'Boston, Massachusetts'], ['expertise', 'Deep Learning'], ['research', 'Retinal imaging'], ['profile', url]];
  const candidate: Candidate = {id: `candidate-${index}`, name, jobTitle: 'Associate Professor', organization: 'Example University', location: 'Boston, Massachusetts', expertise: ['Deep Learning'], researchAreas: ['Retinal imaging'], profileUrl: url, contactUrl: null, publicEmail: 'guessed@university.edu', contradictions: [], evidence: fields.map(([field, value], i) => ({id: `candidate-${index}-e${i+1}`, field, value, sourceUrl: url, sourceTitle: 'Official faculty page', sourceType: 'university', citationId: `citation-${index}-${i}`, excerptOrSummary: `Supports ${field}`, professionalSource: true, currentOrRecent: true, explicitlyPublicProfessionalContact: false}))};
  const grounding: Grounding = {sources: [{url, title: 'Official faculty page'}], searchQueries: [plan.queries[0]!], searchSuggestions: [], citations: candidate.evidence.map(e => ({id: e.citationId, url, text: `${name}: ${e.field === 'profile' ? 'Official professional faculty profile.' : e.value}`, start: 0, end: 100}))};
  return {candidate, grounding};
}
export function breakdown(c: Candidate, score: number): MatchBreakdown {
  const component = (field: Candidate['evidence'][number]['field']) => ({score, rationale: 'Direct project overlap.', evidenceIds: c.evidence.filter(e => e.field === field).map(e => e.id), matched: field === 'research' ? c.researchAreas : c.expertise, missing: []});
  return {skills: component('expertise'), research: component('research'), projectRelevance: component('research'), mentorType: component('role'), location: component('location'), preferences: component('profile')};
}
export function mockPipeline() {
  const first = fixtureCandidate(); const second = fixtureCandidate('Alex Roe', 2);
  const candidates = [first.candidate, second.candidate];
  const grounding: Grounding = {sources: [...first.grounding.sources, ...second.grounding.sources], citations: [...first.grounding.citations, ...second.grounding.citations], searchQueries: ['retinal researcher university'], searchSuggestions: []};
  const research: Research = {text: 'Grounded professional findings', grounding};
  const values: Record<string, unknown> = {analysis, plan, 'discovery-extraction': {candidates}, 'verification-extraction': {candidates}, scoring: {evaluations: candidates.map((c, i) => ({id: c.id, breakdown: breakdown(c, i === 0 ? 80 : 95), locationCompatibility: 'compatible'}))}, explanations: {explanations: candidates.map(c => ({id: c.id, statementIds: ['overlap', 'research']}))}};
  const structured = vi.fn(async <T>(stage: string, _instruction: string, _data: unknown, schema: z.ZodType<T>) => schema.parse(structuredClone(values[stage])));
  const search = vi.fn(async () => structuredClone(research));
  const client: GeminiClient = {structured: async (stage, instruction, data, schema) => schema.parse(await structured(stage, instruction, data, schema)), research: search};
  return {client, structured, search, values, candidates, grounding};
}
