import { expect, it } from 'vitest';
import { calculateScore, getScoringWeights, scoreCandidates } from '../src/mentor/score-candidates.js';
import { rankCandidates } from '../src/mentor/rank-candidates.js';
import { enforceEvidence } from '../src/mentor/verify-candidates.js';
import { locationMode } from '../src/mentor/schemas.js';
import { analysis, input, breakdown, fixtureCandidate, mockPipeline } from './fixtures.js';
it.each(locationMode.options)('normalizes %s weights', mode => { const w = getScoringWeights(mode); expect(Object.values(w).reduce((a,b) => a+b, 0)).toBeCloseTo(1, 12); expect(Object.values(w).every(n => n >= 0)).toBe(true); });
it('calculates exact deterministic weighted score', () => {
  const b = breakdown(fixtureCandidate().candidate, 100); b.research.score = 80; b.projectRelevance.score = 90; b.mentorType.score = 70; b.location.score = 20; b.preferences.score = 60;
  expect(calculateScore(b, getScoringWeights('medium'))).toBe(80);
  expect(getScoringWeights('none').location).toBe(0);
});
it('does not penalize distance when location is none', () => { const b = breakdown(fixtureCandidate().candidate, 90); b.location.score = 0; expect(calculateScore(b, getScoringWeights('none'))).toBe(90); });
it('filters weak and incompatible in-person candidates', () => {
  const f = fixtureCandidate(); const c = {...enforceEvidence(f.candidate, f.grounding)!, matchBreakdown: breakdown(f.candidate, 90), matchScore: 90, locationCompatibility: 'uncertain' as const};
  expect(rankCandidates([c], {...analysis, locationRequirement: {...analysis.locationRequirement, importance: 'in_person_required'}}, 60)).toEqual([]);
  expect(rankCandidates([{...c, matchScore: 59}], analysis, 60)).toEqual([]);
});
it('rejects invented or unrelated evidence IDs in assessments', async () => {
  const m = mockPipeline(); const c = enforceEvidence(m.candidates[0]!, m.grounding)!;
  const b = breakdown(c, 90); b.skills.evidenceIds = ['invented'];
  m.values.scoring = {evaluations: [{id: c.id, breakdown: b, locationCompatibility: 'compatible'}]};
  expect(await scoreCandidates(m.client, [c], analysis, input, new AbortController().signal)).toEqual([]);
});
