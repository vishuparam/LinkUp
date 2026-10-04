import { normalize, safeUrl, unique } from '../utils/normalize.js';
import type { Candidate } from './types.js';
const same = (a: Candidate, b: Candidate) => {
  const profileMatch = a.profileUrl && b.profileUrl && safeUrl(a.profileUrl) === safeUrl(b.profileUrl);
  return Boolean(profileMatch || normalize(a.name) === normalize(b.name));
};
/** Conservatively collapse identical names; conflicting identities are dropped during verification. */
export function deduplicateCandidates(candidates: Candidate[]): Candidate[] {
  const result: Candidate[] = [];
  for (const candidate of candidates) {
    const matches = result.filter(existing => same(existing, candidate));
    const group = [...matches, candidate];
    const merged = {...group[0]!};
    merged.expertise = unique(group.flatMap(c => c.expertise));
    merged.researchAreas = unique(group.flatMap(c => c.researchAreas));
    merged.contradictions = unique(group.flatMap(c => c.contradictions));
    const evidence = group.flatMap(c => c.evidence);
    merged.evidence = evidence.filter((e, i) => evidence.findIndex(x => x.field === e.field && x.value === e.value && safeUrl(x.sourceUrl) === safeUrl(e.sourceUrl)) === i);
    for (const m of matches) result.splice(result.indexOf(m), 1);
    result.push(merged);
  }
  return result.map((c, i) => ({...c, id: `candidate-${i + 1}`, evidence: c.evidence.map((e, j) => ({...e, id: `candidate-${i + 1}-e${j + 1}`}))}));
}
