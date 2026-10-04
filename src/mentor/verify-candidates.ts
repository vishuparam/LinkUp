import { candidatesSchema } from './schemas.js';
import { prompts } from './prompts.js';
import { deduplicateCandidates } from './deduplicate.js';
import { sourceQuality, isOfficial } from './source-quality.js';
import { normalize, safeUrl } from '../utils/normalize.js';
import type { Candidate, MentorClient, Grounding, ProjectAnalysis, VerifiedCandidate } from './types.js';
/** Fail closed: the second search must support every exposed field with cited text. */
export function enforceEvidence(candidate: Candidate, grounding: Grounding): VerifiedCandidate | null {
  if (candidate.contradictions.length) return null;
  const evidence = candidate.evidence.filter(e => {
    const citation = grounding.citations.find(c => c.id === e.citationId && c.url === safeUrl(e.sourceUrl));
    if (!citation?.text || sourceQuality(e) < 55) return false;
    if (e.field === 'profile' || e.field === 'contact') return safeUrl(e.value) === citation.url && normalize(citation.text).includes(normalize(candidate.name));
    return citation.text.includes(e.value);
  }).map(e => ({...e, sourceUrl: safeUrl(e.sourceUrl)!}));
  const supported = (field: Candidate['evidence'][number]['field'], value: string | null) => value !== null && evidence.some(e => e.field === field && e.value === value);
  const identities = evidence.filter(e => e.field === 'identity' && e.value === candidate.name && e.currentOrRecent && sourceQuality(e) >= 75);
  if (!identities.length || !evidence.some(e => sourceQuality(e) >= 80)) return null;
  const expertise = candidate.expertise.filter(x => supported('expertise', x));
  const researchAreas = candidate.researchAreas.filter(x => supported('research', x));
  if (!expertise.length && !researchAreas.length) return null;
  const routes = evidence.filter(e => ['profile', 'contact'].includes(e.field) && sourceQuality(e) >= 55).sort((a, b) => sourceQuality(b) - sourceQuality(a));
  const profileEvidence = routes.find(e => e.field === 'profile');
  const contactEvidence = routes.find(e => e.field === 'contact');
  if (!profileEvidence && !contactEvidence) return null;
  const emailEvidence = evidence.find(e => e.field === 'email' && e.value === candidate.publicEmail && e.explicitlyPublicProfessionalContact && sourceQuality(e) >= 80 && grounding.citations.some(c => c.id === e.citationId && Array.from(c.text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi), m => m[0]).includes(e.value)));
  const role = candidate.jobTitle && evidence.some(e => e.field === 'role' && e.value === candidate.jobTitle && e.currentOrRecent) ? candidate.jobTitle : null;
  const organization = candidate.organization && evidence.some(e => e.field === 'organization' && e.value === candidate.organization && e.currentOrRecent) ? candidate.organization : null;
  // Do not expose street-level location even if a model mistakenly extracted it.
  const location = supported('location', candidate.location) && !/\d|\b(street|avenue|road|apartment|suite)\b/i.test(candidate.location ?? '') ? candidate.location : null;
  const publicEmail = emailEvidence?.value ?? null;
  const kept = evidence.filter(e => {
    if (e.field === 'email') return e === emailEvidence;
    if (e.field === 'location') return e.value === location;
    if (e.field === 'role') return e.value === role;
    if (e.field === 'organization') return e.value === organization;
    return true;
  }).map(e => ({...e, excerptOrSummary: `Supports ${e.field}: ${e.value}.`}));
  const sources = kept.map(e => ({url: e.sourceUrl, title: grounding.sources.find(s => s.url === e.sourceUrl)?.title ?? null, type: e.sourceType})).filter((s, i, a) => a.findIndex(x => x.url === s.url) === i);
  return {...candidate, jobTitle: role, organization, location, expertise, researchAreas,
    profileUrl: profileEvidence?.sourceUrl ?? null, contactUrl: contactEvidence?.sourceUrl ?? profileEvidence?.sourceUrl ?? null,
    publicEmail, evidence: kept, sources,
    verificationStatus: role && organization && identities.some(isOfficial) ? 'verified' : 'partially_verified',
    contactStatus: publicEmail ? 'public_email' : contactEvidence && isOfficial(contactEvidence) ? 'official_contact_page' : profileEvidence && isOfficial(profileEvidence) ? 'official_profile_only' : 'professional_profile_only',
  };
}
export async function verifyCandidates(client: MentorClient, candidates: Candidate[], analysis: ProjectAnalysis, signal: AbortSignal) {
  const research = await client.research('verification', prompts.verification, {candidates: candidates.map(c => ({id: c.id, name: c.name, organization: c.organization, profileUrl: c.profileUrl})), analysis}, signal);
  if (!research.grounding.citations.some(c => c.text)) return {candidates: [], research};
  const extracted = candidatesSchema.parse(await client.structured('verification-extraction', prompts.extraction, {research, allowedIdentities: candidates.map(c => ({id: c.id, name: c.name}))}, candidatesSchema, signal));
  const known = extracted.candidates.filter(c => candidates.some(original => normalize(original.name) === normalize(c.name)));
  const verified = deduplicateCandidates(known).map(c => enforceEvidence(c, research.grounding)).filter((c): c is VerifiedCandidate => c !== null);
  return {candidates: verified, research};
}
