import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { demoOpportunities, demoUser } from '../src/data/demo';
import { DemoProvider } from '../src/context/DemoContext';
import { adaptLinkUpData } from '../src/features/linkedinLaunch/adapter';
import { linkedInLaunchDemoUser } from '../src/features/linkedinLaunch/demo';
import { allSectionsText, copyText, sectionText } from '../src/features/linkedinLaunch/export';
import { generateLinkedInProfile, validateLinkedInProfileKit } from '../src/features/linkedinLaunch/generate';
import { normalizeLinkedInSource } from '../src/features/linkedinLaunch/normalize';
import { LinkedInLaunch } from '../src/features/linkedinLaunch/LinkedInLaunch';
import { requestLinkedInProfile } from '../src/features/linkedinLaunch/api';
import { LinkedInExport } from '../src/pages/LinkedInExport';
import { handleLinkedInApi } from '../server/linkedin/api.mjs';
import type { Opportunity, User } from '../src/types';

const cropProject: Opportunity = {
  ...demoOpportunities[0], id: 'crop-prediction', name: 'Crop Genome Forecast', type: 'Project',
  field: 'Agriculture', shortDescription: 'Explore genomic data to predict crop yields.',
  fullDescription: 'The idea combines crop genome records with weather observations to investigate yield patterns. We plan to compare prediction approaches. Join us to help build it.',
  skillsNeeded: ['Python'], rolesNeeded: ['Data scientist'],
};
const foodProject: Opportunity = {
  ...demoOpportunities[0], id: 'food-access', name: 'Food Access Network', type: 'Nonprofit',
  field: 'Community', shortDescription: 'Connect families with local food resources.',
  fullDescription: 'The platform idea organizes pantry information and eligibility guidance in one place. We are looking for volunteers to contribute.',
  skillsNeeded: ['React'], rolesNeeded: ['Volunteer coordinator'],
};

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
  const source = adaptLinkUpData(demoUser, demoOpportunities, ['demo-sprout', 'demo-neighbor']);
  const kit = generateLinkedInProfile(source);
  assert.deepEqual(source.projects?.map(project => project.name), ['Sprout Map', 'Neighbor Notes']);
  assert.equal(kit.experience.length, 0);
  assert.equal(kit.volunteering.length, 0);
  assert.match(kit.projects[0].description || '', /idea in Environment shared on LinkUp/);
  assert.match(kit.about, /Ideas I've shared on LinkUp/);
  assert.doesNotMatch(JSON.stringify(kit), /Frontend developer|Audio collaborator|skills needed/i);
});

test('feature renders profile sections and manual transfer controls', () => {
  const html = renderToStaticMarkup(createElement(LinkedInLaunch, { user: adaptLinkUpData(demoUser, demoOpportunities, ['demo-sprout']) }));
  assert.match(html, /Headline/);
  assert.match(html, /Sprout Map/);
  assert.match(html, /Copy all/);
  assert.match(html, /Open LinkedIn/);
  assert.match(html, /href="https:\/\/www.linkedin.com\/"/);
});

test('export page exposes selectable LinkUp ideas and a Generate action', () => {
  const html = renderToStaticMarkup(createElement(DemoProvider, null, createElement(LinkedInExport)));
  assert.match(html, /Choose ideas to include/);
  assert.match(html, /Generate profile kit/);
  assert.match(html, /Sprout Map/);
  assert.match(html, /Neighbor Notes/);
  assert.doesNotMatch(html, /Pocket Science/);
});

test('different selected LinkUp projects produce distinct, specific export content', () => {
  const opportunities = [cropProject, foodProject];
  const crop = generateLinkedInProfile(adaptLinkUpData(demoUser, opportunities, [cropProject.id]));
  const food = generateLinkedInProfile(adaptLinkUpData(demoUser, opportunities, [foodProject.id]));
  const cropText = allSectionsText(crop);
  const foodText = allSectionsText(food);

  assert.notEqual(cropText, foodText);
  assert.equal(crop.projects.length, 1);
  assert.equal(food.projects.length, 1);
  assert.match(cropText, /genomic data|crop genome records/i);
  assert.match(cropText, /Agriculture/);
  assert.doesNotMatch(cropText, /Food Access Network|pantry information|Community/);
  assert.match(foodText, /families with local food resources|pantry information/i);
  assert.match(foodText, /Nonprofit idea in Community/);
  assert.doesNotMatch(foodText, /Crop Genome Forecast|genomic data|Agriculture/);
  assert.doesNotMatch(cropText + foodText, /Data scientist|Volunteer coordinator|Join us|looking for volunteers/i);
  assert.deepEqual(crop.honors, []);
  assert.deepEqual(food.honors, []);
});

test('multiple selections include both projects; zero selections include no demo projects', () => {
  const opportunities = [cropProject, foodProject];
  const both = generateLinkedInProfile(adaptLinkUpData(demoUser, opportunities, [cropProject.id, foodProject.id]));
  const none = generateLinkedInProfile(adaptLinkUpData(demoUser, opportunities, []));
  assert.deepEqual(both.projects.map(project => project.title), ['Crop Genome Forecast', 'Food Access Network']);
  assert.match(allSectionsText(both), /genomic data/);
  assert.match(allSectionsText(both), /pantry information/);
  assert.deepEqual(none.projects, []);
  assert.doesNotMatch(allSectionsText(none), /Crop Genome Forecast|Food Access Network|ResourceMap/);
  assert.match(none.about, /Learning by building/);
});

test('unknown IDs and incomplete projects are safe and do not invent results', () => {
  const incomplete: Opportunity = { ...cropProject, id: 'bare-project', name: 'Early Idea',
    shortDescription: '', fullDescription: '', field: '', skillsNeeded: [], rolesNeeded: [] };
  const kit = generateLinkedInProfile(adaptLinkUpData(demoUser, [incomplete, foodProject], ['bare-project', 'missing-id']));
  assert.equal(kit.projects.length, 1);
  assert.equal(kit.projects[0].title, 'Early Idea');
  assert.doesNotMatch(allSectionsText(kit), /Food Access Network|10,000|raised|won|semifinalist/i);
});

test('server AI path receives each student and only that student’s selected project', async () => {
  const studentA: User = { ...demoUser, id: 'student-a', name: 'Ari', bio: 'I explore AI in finance.',
    interests: ['AI', 'finance', 'entrepreneurship'], skills: ['Python', 'Machine Learning'] };
  const studentB: User = { ...demoUser, id: 'student-b', name: 'Bea', bio: 'I study sustainability and community gardens.',
    interests: ['environmental science', 'community service'], skills: ['Mapping', 'Environmental Research'] };
  const financeProject: Opportunity = { ...cropProject, id: 'finance-ai', creator: studentA,
    name: 'Finance Lens', field: 'Finance', shortDescription: 'Analyze financial reports with machine learning.',
    fullDescription: 'The idea explores AI summaries of public financial data.' };
  const gardenProject: Opportunity = { ...foodProject, id: 'garden-map', creator: studentB,
    name: 'Garden Routes', field: 'Sustainability', shortDescription: 'Map community gardens and local resources.',
    fullDescription: 'The idea helps neighbors find gardens and volunteer opportunities.' };
  const received: unknown[] = [];
  const provider = async (profile: any) => {
    received.push(profile);
    return { headline: `Student | ${profile.interests[0]}`, about: `${profile.bio} ${profile.projects[0]?.description || ''}`,
      projects: profile.projects.map((project: any) => ({ id: project.id, description: `An idea shared on LinkUp: ${project.description || project.name}` })),
      skills: profile.skills, experienceDescriptions: [], volunteeringDescriptions: [],
      suggestedPost: `I am exploring ${profile.interests[0]}.` };
  };
  const mockFetch = (async (_url: unknown, init: RequestInit) => handleLinkedInApi(
    new Request('http://localhost/api/linkedin-launch/generate', init), { provider },
  )) as typeof fetch;
  const a = await requestLinkedInProfile(adaptLinkUpData(studentA, [financeProject, gardenProject], ['finance-ai']), mockFetch);
  const b = await requestLinkedInProfile(adaptLinkUpData(studentB, [financeProject, gardenProject], ['garden-map']), mockFetch);
  assert.equal(a.mode, 'ai');
  assert.equal(b.mode, 'ai');
  assert.match(a.kit.about, /AI in finance|financial reports/i);
  assert.match(b.kit.about, /sustainability|community gardens/i);
  assert.doesNotMatch(allSectionsText(a.kit), /Garden Routes|Sustainability/);
  assert.doesNotMatch(allSectionsText(b.kit), /Finance Lens|financial reports/);
  assert.deepEqual((received[0] as { projects: { id: string }[] }).projects.map(project => project.id), ['finance-ai']);
  assert.deepEqual((received[1] as { projects: { id: string }[] }).projects.map(project => project.id), ['garden-map']);
  assert.notDeepEqual(received[0], received[1]);
});

test('zero selected projects and failed or malformed AI output use the real-data fallback', async () => {
  const source = adaptLinkUpData(demoUser, demoOpportunities, []);
  const unavailable = await requestLinkedInProfile(source, (async () => { throw new Error('network down'); }) as typeof fetch);
  assert.equal(unavailable.mode, 'fallback');
  assert.deepEqual(unavailable.kit.projects, []);
  assert.match(unavailable.kit.about, /Learning by building/);
  const malformed = await requestLinkedInProfile(source, (async () => new Response(JSON.stringify({ kit: { headline: 'Student', projects: [{ title: 'Fake' }] } }), { status: 200 })) as typeof fetch);
  assert.equal(malformed.mode, 'fallback');
  assert.deepEqual(malformed.kit.projects, []);
});
