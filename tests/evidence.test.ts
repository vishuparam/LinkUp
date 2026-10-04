import { expect, it } from 'vitest';
import { deduplicateCandidates } from '../src/mentor/deduplicate.js';
import { enforceEvidence } from '../src/mentor/verify-candidates.js';
import { extractGroqGrounding } from '../src/groq/grounding.js';
import { fixtureCandidate } from './fixtures.js';
it('merges same person with evidence from multiple pages', () => {
  const a = fixtureCandidate(); const b = fixtureCandidate('Dr. Jane Doe', 2);
  const result = deduplicateCandidates([a.candidate, b.candidate]); expect(result).toHaveLength(1); expect(result[0]!.evidence).toHaveLength(14);
});
it('removes guessed emails and unsupported fields', () => { const f = fixtureCandidate(); f.candidate.expertise.push('Quantum computing'); const c = enforceEvidence(f.candidate, f.grounding)!; expect(c.publicEmail).toBeNull(); expect(c.contactStatus).toBe('official_profile_only'); expect(c.expertise).toEqual(['Deep Learning']); });
it('allows email only when explicitly public/professional and literally cited', () => {
  const f = fixtureCandidate(); const value = 'faculty@university.edu';
  f.candidate.publicEmail = value;
  f.candidate.evidence.push({...f.candidate.evidence[0]!, id: 'email', field: 'email', value, citationId: 'email-citation', explicitlyPublicProfessionalContact: true});
  f.grounding.citations.push({id: 'email-citation', url: f.candidate.profileUrl!, text: `Jane Doe's public university contact email is ${value}.`, start: 0, end: 100});
  expect(enforceEvidence(f.candidate, f.grounding)!.publicEmail).toBe(value);
  f.candidate.evidence.at(-1)!.explicitlyPublicProfessionalContact = false;
  expect(enforceEvidence(f.candidate, f.grounding)!.publicEmail).toBeNull();
});
it.each(['uncited', 'weak', 'contradicted', 'no-route', 'unsupported-person'])('rejects %s candidates', mode => {
  const f = fixtureCandidate();
  if (mode === 'uncited') f.grounding.citations = [];
  if (mode === 'weak') f.candidate.evidence.forEach(e => e.sourceType = 'other_professional_source');
  if (mode === 'contradicted') f.candidate.contradictions = ['Identity mismatch'];
  if (mode === 'no-route') f.candidate.evidence = f.candidate.evidence.filter(e => e.field !== 'profile');
  if (mode === 'unsupported-person') f.candidate.name = 'Invented Person';
  expect(enforceEvidence(f.candidate, f.grounding)).toBeNull();
});
it('rejects contact brokers even if labelled university', () => { const f = fixtureCandidate(); f.candidate.evidence.forEach(e => e.sourceUrl = 'https://rocketreach.co/person'); f.grounding.citations.forEach(c => c.url = 'https://rocketreach.co/person'); expect(enforceEvidence(f.candidate, f.grounding)).toBeNull(); });
it('handles missing metadata and rejects prose URLs', () => expect(extractGroqGrounding({output_text: 'https://madeup.edu'}).sources).toEqual([]));
it('resolves Groq line citations to text returned by browser.open', () => {
  const url = 'https://university.edu/elodie';
  const result = extractGroqGrounding({output: [
    {type: 'mcp_call', name: 'browser.search', status: 'completed', arguments: '{"query":"retinal imaging researcher"}'},
    {type: 'mcp_call', name: 'browser.open', status: 'completed', output: `L0: \nL1: URL: ${url}\nL2: Élodie studies retinal imaging.\nL3: Professional profile`},
    {type: 'message', content: [{type: 'output_text', text: 'Élodie studies retinal imaging【1†L2-L3】', annotations: []}]},
  ]});
  expect(result.citations[0]!.text).toBe('Élodie studies retinal imaging. Professional profile');
  expect(result.sources[0]!.url).toBe(url);
  expect(result.searchQueries).toEqual(['retinal imaging researcher']);
});
it('rejects line citations without a completed opened page', () => {
  const result = extractGroqGrounding({output: [{type: 'message', content: [{type: 'output_text', text: 'Uncited email【1†L2-L3】'}]}]});
  expect(result.citations).toEqual([]);
});
it('accepts a single-line Groq citation only when its opened line exists', () => {
  const result = extractGroqGrounding({output: [
    {type: 'mcp_call', name: 'browser.open', status: 'completed', output: 'L1: URL: https://university.edu/person\nL2: Jane Doe studies retinal imaging.'},
    {type: 'message', content: [{type: 'output_text', text: 'Jane Doe studies retinal imaging【0†L2】 Missing【0†L8】'}]},
  ]});
  expect(result.citations.map(c => c.text)).toEqual(['Jane Doe studies retinal imaging.']);
});
