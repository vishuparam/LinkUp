import { expect, it } from 'vitest';
import { deduplicateCandidates } from '../src/mentor/deduplicate.js';
import { enforceEvidence } from '../src/mentor/verify-candidates.js';
import { extractGroundingSources } from '../src/mentor/grounding.js';
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
it('handles missing metadata and rejects prose URLs', () => expect(extractGroundingSources({output_text: 'https://madeup.edu'}).sources).toEqual([]));
it('extracts actual Interactions annotations using byte offsets', () => {
  const text = 'Élodie studies retinal imaging.'; const url = 'https://university.edu/elodie';
  const result = extractGroundingSources({steps: [{type: 'google_search_call', arguments: {queries: ['retinal imaging']}}, {type: 'model_output', content: [{type: 'text', text, annotations: [{type: 'url_citation', url, title: 'Faculty', start_index: 0, end_index: Buffer.byteLength(text)}]}]}]});
  expect(result.citations[0]!.text).toBe(text); expect(result.searchQueries).toEqual(['retinal imaging']);
});
it('does not use full response when citation offsets are missing', () => { const g = extractGroundingSources({outputs: [{type: 'text', text: 'Uncited email', annotations: [{type: 'url_citation', url: 'https://university.edu'}]}]}); expect(g.citations[0]!.text).toBe(''); });
