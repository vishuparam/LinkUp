// Run npm run dev first. Uses mock API responses, never live provider credentials.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.LINKUP_TEST_BASE || 'http://127.0.0.1:5173';
const storedProject = {
  id: 'integration-retinal', name: 'Retinal AI research', type: 'Project',
  shortDescription: 'Detect retinal disease.',
  fullDescription: 'Build a retinal image classifier and evaluate it with a research mentor.',
  field: 'Medical AI', skillsNeeded: ['Computer vision', 'Research methods'],
  rolesNeeded: ['Researcher'], location: 'Chicago, Illinois', remote: true,
};
try {
  await page.goto(base + '/discover');
  await page.evaluate(project => localStorage.setItem('linkup-created-opportunities-v1', JSON.stringify([project])), storedProject);
  let mentorRequest;
  await page.route('**/api/find-mentors', async route => {
    mentorRequest = route.request().postDataJSON();
    await route.fulfill({ json: { message: 'Mentor search complete.', mentors: [{
      id: 'mock-mentor', name: 'Test Research Mentor', title: 'Researcher',
      organization: 'Fictional Lab', matchScore: 90, expertise: ['Computer vision'], sources: [],
    }] } });
  });
  await page.goto(base + '/mentor-match');
  await page.getByLabel('Your project').selectOption(storedProject.id);
  await page.getByRole('button', { name: 'Find mentors', exact: true }).click();
  await page.getByRole('heading', { name: 'Test Research Mentor' }).waitFor();
  assert.equal(mentorRequest.projectTitle, storedProject.name);
  assert(mentorRequest.projectDescription.includes(storedProject.fullDescription));
  assert.deepEqual(mentorRequest.skillsNeeded, storedProject.skillsNeeded);
  assert.deepEqual(mentorRequest.helpNeeded, storedProject.rolesNeeded);
  assert.equal(mentorRequest.location, storedProject.location);
  let exportRequest;
  await page.route('**/api/linkedin-launch/generate', async route => {
    exportRequest = route.request().postDataJSON();
    await route.fulfill({ json: { error: 'Intentionally unavailable in integration test' } });
  });
  await page.goto(base + '/linkedin-export');
  await page.getByRole('checkbox', { name: /Retinal AI research/ }).check();
  await page.getByLabel('What would you like your profile to highlight? (optional)').fill('Research collaboration');
  await page.getByRole('button', { name: 'Generate profile kit', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'local draft' }).waitFor();
  assert.deepEqual(exportRequest.profile.projects.map(project => project.name), [storedProject.name]);
  assert.deepEqual(exportRequest.profile.goals, ['Research collaboration']);
  await page.getByRole('button', { name: 'Full example', exact: true }).click();
  await page.getByText('Full fictional example with projects, leadership, an award, nonprofit work, and mentorship.').waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: preserved mentor request fields/results and LinkedIn project selection, generation fallback, and full example');
} finally { await browser.close(); }
