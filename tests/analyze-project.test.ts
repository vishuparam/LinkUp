import { expect, it } from 'vitest';
import { analyzeProject } from '../src/mentor/analyze-project.js';
import { generateSearchPlan } from '../src/mentor/search-plan.js';
import { input, mockPipeline, analysis, plan } from './fixtures.js';
it('preserves explicit research and hard location preferences', async () => {
  const {client} = mockPipeline();
  const result = await analyzeProject(client, {...input, remoteAllowed: false, researchRequired: false}, new AbortController().signal);
  expect(result.locationRequirement.importance).toBe('in_person_required'); expect(result.researchRequired).toBe(false);
});
it('rejects malformed model analysis', async () => { const m = mockPipeline(); m.values.analysis = {}; await expect(analyzeProject(m.client, input, new AbortController().signal)).rejects.toThrow(); });
it('rejects duplicate searches', async () => { const m = mockPipeline(); m.values.plan = {...plan, queries: Array(5).fill('same query')}; await expect(generateSearchPlan(m.client, analysis, new AbortController().signal)).rejects.toThrow('redundant'); });
