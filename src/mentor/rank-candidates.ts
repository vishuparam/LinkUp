import type { ProjectAnalysis, ScoredCandidate } from './types.js';
import { normalize } from '../utils/normalize.js';
export function rankCandidates(candidates: ScoredCandidate[], analysis: ProjectAnalysis, minScore: number): ScoredCandidate[] {
  const local = analysis.locationRequirement.importance === 'in_person_required' || !analysis.locationRequirement.remoteAllowed;
  const seen = new Set<string>();
  return candidates.filter(c => c.matchScore >= minScore && c.evidence.length && c.sources.length && (c.profileUrl || c.contactUrl) && (!local || c.locationCompatibility === 'compatible'))
    .sort((a, b) => b.matchScore - a.matchScore || Number(b.verificationStatus === 'verified') - Number(a.verificationStatus === 'verified') || a.name.localeCompare(b.name))
    .filter(c => { const key = normalize(c.name); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 5);
}
