import { describe, expect, it, vi, afterEach } from 'vitest';
import { mentorDirectory } from '../src/data/mentorDirectory.js';
import { detectTopics, rankMentors } from '../src/services/localMentorMatcher.js';
import { defaultMentorPreferences, findMentors } from '../src/services/mentorService.js';
import type { Mentor, MentorSearchInput } from '../src/types/mentor.js';
import type { Opportunity } from '../src/types/index.js';
const project: Opportunity = { id: 'test-environment', name: 'Groundwater monitoring', type: 'Project', shortDescription: 'Monitor environmental pollution.', fullDescription: 'Research groundwater contamination and environmental remediation.', field: 'Environmental Science', skillsNeeded: ['Research'], rolesNeeded: ['Researcher'], location: 'Anywhere', remote: true, creator: { id: 'test', name: 'Demo Student', grade: 11, bio: '', skills: [], interests: [] } };
function input(text: string): MentorSearchInput { return { title: text, description: text, category: text, currentSkills: [], skillsNeeded: [], tags: [], projectType: 'Project', preferences: { ...defaultMentorPreferences, helpAreas: ['Research Methodology'] } }; }
afterEach(() => vi.unstubAllGlobals());
describe('curated directory', () => {
  it('contains 98 unique sourced professionals with meaningful metadata and no guessed remote availability', () => {
    expect(mentorDirectory).toHaveLength(98);
    expect(new Set(mentorDirectory.map(m => m.id)).size).toBe(98);
    for (const mentor of mentorDirectory) {
      expect(mentor.name.length).toBeGreaterThan(3);
      expect(mentor.role.length).toBeGreaterThan(3);
      expect(mentor.categories.length).toBeGreaterThan(0);
      expect(mentor.skills.length).toBeGreaterThan(1);
      expect(mentor.researchAreas.length).toBeGreaterThan(0);
      expect(new URL(mentor.profileUrl).protocol).toBe('https:');
      expect(new URL(mentor.sourceUrl).protocol).toBe('https:');
      expect(mentor.remoteFriendly).toBeUndefined();
    }
  });
});
describe('deterministic matching', () => {
  const scenarios = [
    ['AI computer vision machine learning healthcare medical imaging', 'Healthcare'],
    ['Environmental science groundwater contamination monitoring remediation', 'Environmental Science'],
    ['Robotics robot motion planning control mechatronics', 'Robotics'],
    ['Entrepreneurship startup venture development business', 'Entrepreneurship'],
    ['Biology microbial ecology bacterial genetics nutrient cycling', 'Biology'],
  ] as const;
  it('produces different, sensible top matches for five project types', () => {
    const winners = new Set<string>();
    for (const [text, category] of scenarios) {
      const result = rankMentors(input(text));
      expect(result).toHaveLength(3);
      expect(result[0]!.mentor.categories).toContain(category);
      winners.add(result[0]!.mentor.id);
      expect(result).toEqual(rankMentors(input(text)));
      for (const m of result) { expect(m.matchScore).toBeGreaterThanOrEqual(0); expect(m.matchScore).toBeLessThanOrEqual(100); expect(m.whyMatch).toContain(m.matchingExpertise[0]); }
    }
    expect(winners.size).toBe(5);
  });
  it('keeps a garden project in its primary field even with design/software tags', () => {
    const garden = { ...input('A community garden mapping app with React and design'), category: 'Environment', skillsNeeded: ['React', 'Design'], tags: ['Designer'] };
    expect(rankMentors(garden).every(m => m.mentor.categories.includes('Environmental Science'))).toBe(true);
    expect(rankMentors(garden)).toHaveLength(3);
  });
  it('uses whole phrases and refuses arbitrary matches', () => {
    expect(detectTopics('chair')).not.toContain('Artificial Intelligence');
    expect(detectTopics('AI')).toContain('Artificial Intelligence');
    expect(rankMentors(input('medieval heraldry'))).toEqual([]);
  });
  it('keeps remote location neutral and filters required in-person location', () => {
    const base = input('robotics');
    const changed = { ...base, preferences: { ...base.preferences, city: 'Austin', state: 'TX' } };
    expect(rankMentors(changed)).toEqual(rankMentors(base));
    expect(rankMentors({ ...changed, preferences: { ...changed.preferences, locationImportance: 'in-person', remoteAllowed: false } })).toEqual([]);
    const local = rankMentors({ ...base, preferences: { ...base.preferences, locationImportance: 'in-person', remoteAllowed: false, city: 'Champaign', state: 'IL' } });
    expect(local.length).toBeGreaterThan(0);
    expect(local.every(m => m.mentor.location.city === 'Urbana')).toBe(true);
  });
  it('changes rank for requested help, mentor type, notes, and important location', () => {
    const base = input('AI robotics business entrepreneurship');
    const technical = rankMentors({ ...base, preferences: { ...base.preferences, helpAreas: ['Machine Learning / AI'] } });
    const business = rankMentors({ ...base, preferences: { ...base.preferences, helpAreas: ['Business / Entrepreneurship'], mentorType: 'founder' } });
    expect(technical[0]!.mentor.id).not.toBe(business[0]!.mentor.id);
    const nearby = rankMentors({ ...input('robotics'), preferences: { ...base.preferences, locationImportance: 'important', city: 'Urbana', state: 'IL' } });
    expect(nearby[0]!.mentor.location.city).toBe('Urbana');
    const notes = rankMentors({ ...base, preferences: { ...base.preferences, notes: 'Entrepreneurship venture finance' } });
    expect(notes).not.toEqual(rankMentors(base));
  });
  it('breaks equal scores by stable IDs', () => {
    const original = mentorDirectory.find(m => m.categories.includes('Robotics'))!;
    const a: Mentor = { ...original, id: 'a' }, b: Mentor = { ...original, id: 'b' };
    expect(rankMentors(input('robotics'), [b, a]).map(m => m.mentor.id)).toEqual(['a', 'b']);
  });
});
describe('local/live service', () => {
  it('does not use fetch in default demo mode', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const result = await findMentors(project, defaultMentorPreferences);
    expect(result.mode).toBe('local'); expect(result.mentors).toHaveLength(3); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([429, 402, 503])('falls back on live HTTP %s', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    const result = await findMentors(project, defaultMentorPreferences, { mode: 'live' });
    expect(result.mode).toBe('local'); expect(result.mentors).toHaveLength(3);
  });
  it('falls back for network errors and malformed responses', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('quota exceeded')).mockResolvedValueOnce(new Response('{"mentors":[{"name":"Bad","profileUrl":"javascript:alert(1)"}]}'));
    vi.stubGlobal('fetch', fetch);
    for (let i = 0; i < 2; i++) expect((await findMentors(project, defaultMentorPreferences, { mode: 'live' })).mode).toBe('local');
  });
});

