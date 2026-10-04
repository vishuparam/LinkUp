import { afterEach, expect, it, vi } from 'vitest';
import { findMentors } from '../src/mentor/index.js';
import { getConfig } from '../src/mentor/config.js';
import { input, mockPipeline } from './fixtures.js';
afterEach(() => vi.useRealTimers());
it('runs entire pipeline offline and ranks evidence-based matches', async () => {
  const m = mockPipeline(); const result = await findMentors(input, {client: m.client, config: getConfig({})});
  expect(result.mentors.map(c => [c.name, c.matchScore])).toEqual([['Alex Roe', 95], ['Jane Doe', 80]]);
  expect(result.mentors.every(c => c.publicEmail === null)).toBe(true);
  expect(result.mentors[0]!.whyMatch).toContain('Deep Learning');
  expect(result.meta).toMatchObject({candidateCount: 2, verifiedCandidateCount: 2, returnedCount: 2});
  expect(m.structured.mock.calls.map(c => c[0])).toEqual(['analysis', 'plan', 'discovery-extraction', 'verification-extraction', 'scoring', 'explanations']);
  expect(m.search).toHaveBeenCalledTimes(2);
  expect(result.meta.grounding[0]!.citations[0]).not.toHaveProperty('text');
});
it('returns an empty array without fabricated fallback people', async () => {
  const m = mockPipeline(); m.values['verification-extraction'] = {candidates: []};
  const result = await findMentors(input, {client: m.client}); expect(result.mentors).toEqual([]); expect(result.message).toContain('No sufficiently verified');
});
it('stops without extraction when no cited research exists', async () => {
  const m = mockPipeline(); m.search.mockResolvedValue({text: 'A famous person', grounding: {sources: [], citations: [], searchQueries: [], searchSuggestions: []}});
  expect((await findMentors(input, {client: m.client})).mentors).toEqual([]); expect(m.structured).toHaveBeenCalledTimes(2);
});
it('enforces deadline even if a provider ignores cancellation', async () => {
  vi.useFakeTimers(); const m = mockPipeline(); m.structured.mockImplementation(() => new Promise(() => {}));
  const promise = findMentors(input, {client: m.client, config: {...getConfig({}), timeoutMs: 1000}});
  const assertion = expect(promise).rejects.toMatchObject({code: 'SEARCH_TIMEOUT', status: 504});
  await vi.advanceTimersByTimeAsync(1001); await assertion;
});
it('rejects new explanation claims via nonexistent statement IDs', async () => {
  const m = mockPipeline(); m.values.explanations = {explanations: [{id: 'candidate-1', statementIds: ['agreed-to-mentor']}, {id: 'candidate-2', statementIds: ['research']}]};
  await expect(findMentors(input, {client: m.client})).rejects.toMatchObject({code: 'GEMINI_ERROR'});
});
