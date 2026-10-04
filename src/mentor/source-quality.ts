import type { Candidate } from './types.js';
import { safeUrl } from '../utils/normalize.js';
type Evidence = Candidate['evidence'][number];
const quality: Record<Evidence['sourceType'], number> = {university: 100, research_lab: 100, company: 90, professional_organization: 90, personal_professional_site: 80, publication: 75, linkedin_public_result: 55, other_professional_source: 40};
const denied = ['rocketreach.co', 'zoominfo.com', 'apollo.io', 'signalhire.com', 'contactout.com', 'hunter.io', 'lusha.com', 'whitepages.com', 'spokeo.com', 'beenverified.com', 'truepeoplesearch.com', 'facebook.com', 'instagram.com', 'tiktok.com'];
export function sourceQuality(e: Evidence): number {
  const url = safeUrl(e.sourceUrl);
  if (!url || !e.professionalSource) return 0;
  const host = new URL(url).hostname.toLowerCase();
  if (denied.some(d => host === d || host.endsWith(`.${d}`))) return 0;
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 55;
  return quality[e.sourceType];
}
export const isOfficial = (e: Evidence) => sourceQuality(e) >= 90;
