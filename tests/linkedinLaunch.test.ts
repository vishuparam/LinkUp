import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { demoOpportunities, demoUser } from '../src/data/demo';
import { adaptLinkUpData } from '../src/features/linkedinLaunch/adapter';
import { linkedInLaunchDemoUser } from '../src/features/linkedinLaunch/demo';
import { allSectionsText, copyText, sectionText } from '../src/features/linkedinLaunch/export';
import { generateLinkedInProfile, validateLinkedInProfileKit } from '../src/features/linkedinLaunch/generate';
import { normalizeLinkedInSource } from '../src/features/linkedinLaunch/normalize';
import { LinkedInLaunch } from '../src/features/linkedinLaunch/LinkedInLaunch';

test('normalization keeps supported facts and removes private contact information', () => {
  const source = normalizeLinkedInSource({
    name: 'Sam', bio: 'Reach me at sam@example.org or 555-123-4567',
    projects: [{ name: 'Project A', links: { website: 'javascript:alert(1)' } }],
    mentors: [
      { name: 'Private Mentor', learningFocus: 'Robotics', summary: 'Email mentor@example.org' },
      { shareInExport: true, name: 'Public Mentor', learningFocus: 'Design', summary: 'Call 555-123-4567' },
    ],
  });
  assert.equal(source.mentors?.length, 1);
  assert.equal(source.projects?.[0].links?.website, undefined);
  assert.doesNotMatch(JSON.stringify(source), /sam@example|mentor@example|555-123-4567|Private Mentor/);
});

test('generates several projects and deduplicates skills', () => {
  const kit = generateLinkedInProfile(linkedInLaunchDemoUser);
  assert.equal(kit.projects.length, 2);
  assert.equal(kit.skills.filter(skill => skill.toLowerCase() === 'react').length, 1);
  assert.equal(kit.volunteering.length, 1);
  assert.equal(kit.experience.length, 1);
  assert.equal(kit.honors.length, 1);
  assert.match(sectionText(kit, 'projects'), /GitHub: https:\/\/github.com\/example\/resourcemap/);
  assert.match(allSectionsText(kit), /Suggested First Post/);
});

test('incomplete profile works without optional sections', () => {
  const kit = generateLinkedInProfile({ name: 'Alex' });
  assert.equal(kit.projects.length, 0);
  assert.equal(kit.experience.length, 0);
  assert.equal(kit.honors.length, 0);
  assert.equal(kit.mentorship.length, 0);
  assert.match(kit.about, /Alex/);
});

test('does not invent impact, awards, or endorsements', () => {
  const kit = generateLinkedInProfile({
    projects: [{ name: 'Garden App', description: 'Prototype for tracking plants' }],
    mentors: [{ shareInExport: true, learningFocus: 'Interface design' }],
  });
  const output = JSON.stringify(kit);
  assert.doesNotMatch(output, /10,000|raised|semifinalist|endorsed|world-class/i);
  assert.match(output, /Prototype for tracking plants/);
});

test('includes only supplied project achievements and school', () => {
  const kit = generateLinkedInProfile({ school: 'Lincoln High School', bio: 'I enjoy robotics',
    projects: [{ name: 'Robot Kit', achievements: ['Won the local design award'] }] });
  assert.match(kit.about, /Lincoln High School/);
  assert.match(kit.projects[0].description || '', /Won the local design award/);
});

test('malformed optional arrays are safely normalized', () => {
  const kit = generateLinkedInProfile({ projects: null as never, skills: 'React' as never, mentors: null as never });
  assert.deepEqual(kit.projects, []);
  assert.deepEqual(kit.skills, []);
  assert.deepEqual(kit.mentorship, []);
});

test('validator bounds headline and removes malformed collections', () => {
  const kit = validateLinkedInProfileKit({
    headline: 'x'.repeat(300), about: '', experience: null as never, projects: [], skills: ['React', 'react'],
    honors: [], volunteering: [], mentorship: [], suggestedPost: '',
  });
  assert.equal(kit.headline.length, 220);
  assert.deepEqual(kit.experience, []);
  assert.deepEqual(kit.skills, ['React']);
  assert.deepEqual(validateLinkedInProfileKit(null).projects, []);
});

test('copy operation reports clipboard failure to its caller', async () => {
  let copied = '';
  await copyText('Headline', { writeText: async text => { copied = text; } });
  assert.equal(copied, 'Headline');
  await assert.rejects(copyText('Headline', undefined));
});

test('LinkUp adapter includes only the creator’s ideas, without claiming needed skills or roles', () => {
  const source = adaptLinkUpData(demoUser, demoOpportunities);
  const kit = generateLinkedInProfile(source);
  assert.deepEqual(source.projects?.map(project => project.name), ['Sprout Map', 'Neighbor Notes']);
  assert.equal(kit.experience.length, 0);
  assert.equal(kit.volunteering.length, 0);
  assert.match(kit.projects[0].description || '', /Idea shared on LinkUp/);
  assert.match(kit.about, /Ideas I've shared on LinkUp/);
  assert.doesNotMatch(JSON.stringify(kit), /Frontend developer|Audio collaborator|skills needed/i);
});

test('feature renders profile sections and manual transfer controls', () => {
  const html = renderToStaticMarkup(createElement(LinkedInLaunch, { user: adaptLinkUpData(demoUser, demoOpportunities) }));
  assert.match(html, /Headline/);
  assert.match(html, /Sprout Map/);
  assert.match(html, /Copy all/);
  assert.match(html, /Open LinkedIn/);
  assert.match(html, /href="https:\/\/www.linkedin.com\/"/);
});
