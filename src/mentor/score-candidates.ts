import { evaluationsSchema } from './schemas.js';
import { prompts } from './prompts.js';
import type { GeminiClient, LocationImportance, MatchBreakdown, MentorInput, ProjectAnalysis, ScoredCandidate, VerifiedCandidate, Candidate } from './types.js';
export type Weights = Record<keyof MatchBreakdown, number>;
export function getScoringWeights(mode: LocationImportance): Weights {
  const location = {none: 0, low: 0.03, medium: 0.10, high: 0.18, in_person_required: 0.25}[mode];
  const delta = 0.10 - location;
  return {skills: .30 + delta * .30 / .75, research: .25 + delta * .25 / .75, projectRelevance: .20 + delta * .20 / .75, mentorType: .10, location, preferences: .05};
}
export function calculateScore(breakdown: MatchBreakdown, weights: Weights): number {
  const keys = Object.keys(weights) as (keyof Weights)[];
  const total = keys.reduce((n, k) => n + weights[k], 0);
  return Math.round(Math.max(0, Math.min(100, keys.reduce((n, k) => n + breakdown[k].score * weights[k], 0) / total)));
}
const relevantFields: Record<keyof MatchBreakdown, Candidate['evidence'][number]['field'][]> = {
  skills: ['expertise'], research: ['research', 'expertise'], projectRelevance: ['research', 'expertise'],
  mentorType: ['role'], location: ['location'], preferences: ['contact', 'profile', 'email'],
};
export async function scoreCandidates(client: GeminiClient, candidates: VerifiedCandidate[], analysis: ProjectAnalysis, input: MentorInput, signal: AbortSignal): Promise<ScoredCandidate[]> {
  const result = evaluationsSchema.parse(await client.structured('scoring', prompts.scoring, {candidates, analysis, preferences: {mentorType: input.mentorType, compensation: input.compensation, additionalPreferences: input.additionalPreferences}}, evaluationsSchema, signal));
  const weights = getScoringWeights(analysis.locationRequirement.importance);
  const scores: ScoredCandidate[] = [];
  for (const candidate of candidates) {
    const assessments = result.evaluations.filter(e => e.id === candidate.id);
    if (assessments.length !== 1) continue;
    const assessment = assessments[0]!;
    const b = assessment.breakdown;
    let invalid = false;
    for (const key of Object.keys(b) as (keyof MatchBreakdown)[]) {
      const c = b[key];
      if (c.evidenceIds.some(id => !candidate.evidence.some(e => e.id === id && relevantFields[key].includes(e.field)))) invalid = true;
      if (!c.evidenceIds.length) c.score = 0;
      c.matched = c.matched.filter(x => (key === 'research' ? candidate.researchAreas : candidate.expertise).includes(x));
      c.rationale = c.evidenceIds.length ? `Compatibility assessed against project requirements using evidence: ${c.evidenceIds.join(', ')}.` : 'Insufficient verified evidence.';
      c.missing = []; // Unverified model prose is not part of the public response.
    }
    if (invalid) continue;
    if (!candidate.location || !b.location.evidenceIds.length) assessment.locationCompatibility = 'uncertain';
    if (assessment.locationCompatibility === 'uncertain') b.location.score = 0;
    if (assessment.locationCompatibility === 'incompatible') b.location.score = Math.min(20, b.location.score);
    scores.push({...candidate, matchBreakdown: b, matchScore: calculateScore(b, weights), locationCompatibility: assessment.locationCompatibility});
  }
  return scores;
}
