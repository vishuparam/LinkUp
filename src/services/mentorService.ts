import type { Opportunity } from '../types/index.js';
import type { Mentor, MentorPreferences, MentorSearchInput, MentorSearchResult } from '../types/mentor.js';
import { rankMentors } from './localMentorMatcher.js';
export const defaultMentorPreferences: MentorPreferences = { helpAreas: [], mentorType: 'any', locationImportance: 'none', city: '', state: '', remoteAllowed: true, notes: '' };
export function projectSearchInput(project: Opportunity, preferences: MentorPreferences): MentorSearchInput {
  return { title: project.name, description: `${project.shortDescription} ${project.fullDescription}`, category: project.field, currentSkills: project.creator.skills, skillsNeeded: project.skillsNeeded, tags: project.rolesNeeded, projectType: project.type, preferences };
}
function localResult(input: MentorSearchInput): MentorSearchResult {
  const mentors = rankMentors(input);
  return { mentors, mode: 'local', message: mentors.length < 3 ? `Found ${mentors.length} relevant potential mentor${mentors.length === 1 ? '' : 's'}. Try broader topics or less restrictive location preferences for more results.` : 'Your strongest matches from our curated professional directory.' };
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; }
function webUrl(value: unknown): value is string { if (typeof value !== 'string') return false; try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } }
// Default demo mode never makes an API call. Live mode remains opt-in for later.
export async function findMentors(project: Opportunity, preferences: MentorPreferences, options: { mode?: 'local' | 'live' } = {}): Promise<MentorSearchResult> {
  const input = projectSearchInput(project, preferences);
  if (options.mode !== 'live') return localResult(input);
  try {
    const response = await fetch('/api/find-mentors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000), body: JSON.stringify({ projectTitle: input.title, projectDescription: input.description, skills: input.currentSkills, skillsNeeded: input.skillsNeeded, helpNeeded: preferences.helpAreas, mentorType: preferences.mentorType === 'any' ? undefined : preferences.mentorType, location: [preferences.city, preferences.state].filter(Boolean).join(', ') || undefined, locationImportance: { none: 'none', nearby: 'low', important: 'high', 'in-person': 'in_person_required' }[preferences.locationImportance], remoteAllowed: preferences.remoteAllowed, additionalPreferences: preferences.notes }) });
    if (!response.ok) return localResult(input); // Includes 429, exhausted credits, and unavailable providers.
    const body: unknown = await response.json();
    if (!record(body) || !Array.isArray(body.mentors)) return localResult(input);
    const mentors = body.mentors.flatMap((value: unknown) => {
      if (!record(value) || typeof value.name !== 'string' || !webUrl(value.profileUrl)) return [];
      const sources = Array.isArray(value.sources) ? value.sources.filter(record).filter(s => webUrl(s.url)).map(s => ({ url: String(s.url), name: typeof s.title === 'string' ? s.title : 'Public professional source' })) : [];
      if (!sources.length) return [];
      const mentor: Mentor = { id: typeof value.id === 'string' ? value.id : value.profileUrl, name: value.name, role: typeof value.title === 'string' ? value.title : 'Professional', organization: typeof value.organization === 'string' ? value.organization : '', mentorType: 'other', categories: [], skills: strings(value.expertise), researchAreas: strings(value.researchAreas), projectTypes: [], location: {}, description: '', profileUrl: value.profileUrl, sourceUrl: sources[0]!.url, sourceName: sources[0]!.name, ...(webUrl(value.contactUrl) ? { contactUrl: value.contactUrl } : {}) };
      return [{ mentor, matchScore: typeof value.matchScore === 'number' && Number.isFinite(value.matchScore) ? Math.min(100, Math.max(0, Math.round(value.matchScore))) : 0, whyMatch: typeof value.whyMatch === 'string' ? value.whyMatch : 'Review the professional profile to assess relevance.', matchingExpertise: strings(value.matchingExpertise), sources, breakdown: { topic: 0, help: 0, skills: 0, research: 0, type: 0, location: 0 } }];
    }).slice(0, 3);
    return mentors.length ? { mentors, mode: 'live', message: 'Potential mentors from public professional sources.' } : localResult(input);
  } catch { return localResult(input); }
}
