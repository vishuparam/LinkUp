import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const scenarios = [
  ['ai', 'Retinal AI', 'Artificial Intelligence', 'Use computer vision and machine learning for medical imaging and healthcare.', ['Machine learning', 'Computer vision'], 'Machine Learning / AI'],
  ['environment', 'Groundwater Watch', 'Environmental Science', 'Study groundwater contamination, environmental monitoring and remediation.', ['Research'], 'Scientific Research'],
  ['robotics', 'Robot Motion Lab', 'Robotics', 'Build robotics motion planning and robot control for a mobile robot.', ['Robotics', 'Control'], 'Engineering'],
  ['business', 'Student Venture', 'Entrepreneurship', 'Build a business startup through entrepreneurship and venture development.', ['Business', 'Entrepreneurship'], 'Business / Entrepreneurship'],
  ['biology', 'Microbial Soil Lab', 'Biology', 'Study microbial ecology, bacterial genetics, nutrient cycling and plant growth.', ['Biology', 'Research'], 'Scientific Research'],
];
const projects = scenarios.map(([id, name, field, description, skills]) => ({ id: 'test-' + id, name, type: 'Project', field, shortDescription: description, fullDescription: description, skillsNeeded: skills, rolesNeeded: ['Collaborator'], location: 'Anywhere', remote: true }));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext();
await context.addInitScript(data => localStorage.setItem('linkup-created-opportunities-v1', JSON.stringify(data)), projects);
const page = await context.newPage();
const errors = []; let apiCalls = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.route('**/api/find-mentors', route => { apiCalls++; return route.abort(); });
const base = process.env.LINKUP_TEST_BASE || 'http://127.0.0.1:5173';
await mkdir('test-results', { recursive: true });
async function overflow() { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow'); }
async function axe(label) { await page.waitForTimeout(450); const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); assert.deepEqual(result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), [], label); }
async function flow(scenario, width, location = false) {
  const [id, , , , , help] = scenario;
  await page.goto(base + '/mentor-match?projectId=test-' + id);
  assert.equal(await page.getByLabel('Your project', {exact:true}).inputValue(), 'test-' + id);
  await page.getByRole('button', { name:'Find mentors', exact:true }).click();
  await page.getByRole('heading', {name:'What areas would you like your mentor to help with?'}).waitFor();
  await page.getByRole('button', {name:'Continue →'}).click();
  await page.getByRole('alert').waitFor();
  await page.getByRole('checkbox', {name:help, exact:true}).check();
  if (width === 390) { await axe('Mobile question 1'); await page.screenshot({path:'test-results/mentor-question-390.png',fullPage:true}); }
  await page.getByRole('button', {name:'Continue →'}).click();
  await page.getByRole('heading', {name:'How important is it for your mentor to be near you?'}).waitFor();
  if (location) {
    await page.getByRole('radio', {name:/In-person required/}).check();
    await page.getByRole('button', {name:'Continue →'}).click();
    await page.getByRole('alert').waitFor();
    await page.getByLabel('City', {exact:true}).fill('Urbana');
    await page.getByLabel('State', {exact:true}).fill('IL');
  }
  await page.getByRole('button', {name:'Continue →'}).click();
  await page.getByRole('heading', {name:'What type of mentor would be most helpful?'}).waitFor();
  await page.getByRole('radio', {name:'Professor / Researcher',exact:true}).check();
  await page.getByLabel(/Anything else/).fill('I would like research guidance.');
  await overflow();
  await page.getByRole('button', {name:'Find my mentors →'}).click();
  await page.locator('.mentor-loading').waitFor();
  if (width === 1440 && id === 'ai') {
    const observed = new Set();
    while (await page.locator('.mentor-loading').count()) { observed.add(await page.locator('.mentor-stages .active').innerText()); await page.waitForTimeout(150); }
    assert.equal(observed.size, 7, 'All seven stages appear');
  }
  await page.getByRole('heading', {name:'Meet your potential mentors.'}).waitFor();
  await page.waitForTimeout(750);
  assert.equal(await page.locator('.mentor-result').count(), 3);
  for (const card of await page.locator('.mentor-result').all()) {
    assert.match(await card.locator('.mentor-score').innerText(), /\d+%/);
    assert(await card.getByText('WHY THIS MATCH').isVisible());
    for (const link of await card.locator('a').all()) assert.match(await link.getAttribute('href'), /^(https:\/\/|mailto:)/);
    if (location) assert.match(await card.locator('.mentor-location').innerText(), /Urbana, Illinois/);
  }
  await overflow();
  const winner = await page.locator('.mentor-result h3').first().innerText();
  await page.screenshot({path:`test-results/mentor-${id}-${width}.png`,fullPage:true});
  if (id === 'ai') await axe('Results ' + width);
  console.log('PASS',id,width,'top match:',winner,location?'in-person':'remote-neutral');
  return winner;
}
try {
  for (const width of [1440,768,390]) { await page.setViewportSize({width,height:950}); await flow(scenarios[0],width); }
  await page.emulateMedia({reducedMotion:'reduce'});
  const winners = new Set();
  for (const scenario of scenarios) winners.add(await flow(scenario,390,scenario[0]==='robotics'));
  assert.equal(winners.size,5,'Five project types have different top matches');
  await page.getByRole('button',{name:'Adjust preferences'}).click();
  await page.getByRole('heading',{name:'What areas would you like your mentor to help with?'}).waitFor();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:'Find mentors',exact:true}).waitFor();
  // Keyboard access and every existing route, without calling external services.
  await page.goto(base + '/mentor-match'); await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to content');
  for (const route of ['/','/discover','/create','/saved','/your-projects','/profile','/projects/demo-sprout','/mentor-match','/linkedin-export']) {
    await page.goto(base + route); await page.getByRole('heading',{level:1}).waitFor(); await overflow();
    console.log('PASS route',route);
  }
  assert.equal(apiCalls,0,'No live mentor API requests');
  assert.deepEqual(errors,[],'No browser runtime/console errors');
  console.log('PASS: preference validation, stages, top3, scores, reasons, link targets, project deep link, in-person filter, reduced motion, accessibility, mobile and all routes. ZERO mentor API calls.');
} finally { await browser.close(); }
