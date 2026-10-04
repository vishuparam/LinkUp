import { describe, expect, it, vi, afterEach } from 'vitest';
import { buildLocalProfileKit, interestTemplates, skillOptions } from '../src/features/linkedinLaunch/templates.js';
afterEach(() => vi.unstubAllGlobals());
describe('local LinkedIn templates', () => {
  it('has 10 interests and exactly three complete unique projects per interest', () => {
    expect(interestTemplates).toHaveLength(10);
    expect(new Set(interestTemplates.map(item => item.id)).size).toBe(10);
    const ids: string[] = [];
    for (const interest of interestTemplates) {
      expect(interest.projects).toHaveLength(3);
      expect(interest.headline.length).toBeLessThanOrEqual(220);
      for (const project of interest.projects) {
        ids.push(project.id);
        expect(project.description.length).toBeGreaterThan(20);
        expect(project.linkedInDescription.length).toBeGreaterThan(80);
        expect(project.recommendedSkills.every(skill => skillOptions.includes(skill))).toBe(true);
      }
    }
    expect(new Set(ids).size).toBe(30);
  });
  it('builds all 30 kits without a fetch call, unresolved placeholders, or invented experience', () => {
    const fetch = vi.fn(() => { throw new Error('No API available'); });
    vi.stubGlobal('fetch', fetch);
    const headlines = new Set<string>();
    for (const interest of interestTemplates) {
      headlines.add(interest.headline);
      for (const project of interest.projects) {
        const kit = buildLocalProfileKit(interest.id, ['Research', 'Problem Solving'], project.id);
        expect(kit.headline).toBe(interest.headline);
        expect(kit.projects[0]!.title).toBe(project.name);
        expect(kit.projects[0]!.description).toBe(project.linkedInDescription);
        expect(kit.about).toContain(project.name);
        expect(kit.suggestedPost).toContain(project.name);
        expect(kit.about).toContain('Research, Problem Solving');
        expect(kit.skills).toEqual(['Research', 'Problem Solving']);
        expect(kit.experience).toEqual([]); expect(kit.honors).toEqual([]); expect(kit.mentorship).toEqual([]); expect(kit.volunteering).toEqual([]);
        expect(JSON.stringify(kit)).not.toMatch(/\{(?:project|field|skills|description)\}|I (?:won|founded|completed|launched)|award-winning|professional experience/);
        expect(kit).toEqual(buildLocalProfileKit(interest.id, ['Problem Solving', 'Research'], project.id));
      }
    }
    expect(headlines.size).toBe(10); expect(fetch).not.toHaveBeenCalled();
  });
  it('changes every key content section between engineering and chemistry', () => {
    const engineering = buildLocalProfileKit('engineering', ['Programming', 'Engineering Design', 'Problem Solving'], 'engineering-irrigation');
    const chemistry = buildLocalProfileKit('chemistry', ['Scientific Research', 'Research'], 'chemistry-materials');
    expect(engineering.headline).not.toBe(chemistry.headline);
    expect(engineering.about).not.toBe(chemistry.about);
    expect(engineering.projects).not.toEqual(chemistry.projects);
    expect(engineering.suggestedPost).not.toBe(chemistry.suggestedPost);
    expect(chemistry.about).toContain('chemistry');
    expect(chemistry.about).not.toContain('Smart Irrigation');
  });
  it('changes the kit for another project and skill selection', () => {
    const a = buildLocalProfileKit('engineering', ['Programming'], 'engineering-irrigation');
    const b = buildLocalProfileKit('engineering', ['CAD', 'Engineering Design'], 'engineering-home');
    expect(a.about).not.toBe(b.about); expect(a.suggestedPost).not.toBe(b.suggestedPost);
    expect(b.skills).toEqual(['CAD', 'Engineering Design']);
    expect(b.projects[0]!.skills).toEqual(b.skills);
  });
  it('rejects missing choices and projects belonging to a different interest', () => {
    expect(() => buildLocalProfileKit('', ['Programming'], 'engineering-irrigation')).toThrow();
    expect(() => buildLocalProfileKit('engineering', [], 'engineering-irrigation')).toThrow();
    expect(() => buildLocalProfileKit('chemistry', ['Research'], 'engineering-irrigation')).toThrow();
    expect(() => buildLocalProfileKit('engineering', ['Unknown Skill'], 'engineering-irrigation')).toThrow();
  });
  it('ignores unsupported skills and deduplicates selected skills', () => {
    const kit = buildLocalProfileKit('software', ['Python', 'Python', 'not a supported skill'], 'software-planner');
    expect(kit.skills).toEqual(['Python']);
  });
});
