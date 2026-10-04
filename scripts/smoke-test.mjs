// Optional browser verification: npm install --no-save --package-lock=false playwright
// Start npm run dev first, then run node scripts/smoke-test.mjs.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const base = 'http://127.0.0.1:5173';
async function expectCards(count) {
  await page.waitForFunction(expected => document.querySelectorAll('article').length === expected, count);
  assert.equal(await page.locator('article').count(), count);
}
await mkdir('test-results', { recursive: true });

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(base);
    await page.getByRole('heading', { level: 1, name: 'Big ideas start with a small team.' }).waitFor();
    for (const [label, heading] of [
      ['Discover', 'Find your people. Build your thing.'],
      ['Saved', 'Your next possibilities'],
      ['Create', 'Make room for your idea'],
      ['Your Projects', 'Your ideas, taking shape'],
      ['Profile', 'Your profile'],
      ['Mentor Match', 'Mentor Match'],
      ['LinkedIn Export', 'LinkedIn Export'],
    ]) {
      await page.getByRole('navigation').getByRole('link', { name: label, exact: true }).click();
      await page.getByRole('heading', { level: 1, name: heading, exact: true }).waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} overflows at ${viewport.width}`);
    }
    await page.getByRole('link', { name: 'LinkUp home' }).click();
    await page.getByRole('link', { name: 'Find your next project' }).click();
    await expectCards(5);
    await page.getByLabel('Search opportunities').fill('React');
    await expectCards(1);
    await page.getByLabel('Search opportunities').fill('no-such-project');
    await page.getByText('No matches yet.').waitFor();
    await page.getByLabel('Search opportunities').fill('');
    await page.getByLabel('Opportunity type').selectOption('Company');
    await expectCards(1);
    await page.getByLabel('Opportunity type').selectOption('All');
    await page.getByRole('button', { name: 'Save Sprout Map', exact: true }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Saved', exact: true }).click();
    await expectCards(1);
    await page.getByRole('link', { name: 'View opportunity' }).click();
    await page.getByRole('heading', { level: 1, name: 'Sprout Map' }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Details overflow');
    await page.screenshot({ path: `test-results/details-${viewport.width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Saved ✓' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Saved', exact: true }).click();
    await page.getByText('Nothing saved yet.').waitFor();
    await page.getByRole('navigation').getByRole('link', { name: 'Create', exact: true }).click();
    await page.getByLabel('Opportunity name').fill('Test student idea');
    await page.getByLabel('Field', { exact: false }).fill('Science');
    await page.getByLabel('Short description').fill('A browser-tested student opportunity.');
    await page.getByLabel('Full description').fill('A team idea created during automated browser checks.');
    await page.getByLabel('Skills needed').fill('Research, Writing');
    await page.getByLabel('Roles needed').fill('Researcher, Editor');
    await page.getByLabel('Location').fill('Anywhere');
    await page.getByLabel('Application questions').fill('What would you like to learn?');
    await page.getByRole('button', { name: 'Create demo opportunity' }).click();
    await page.getByRole('heading', { level: 1, name: 'Test student idea' }).waitFor();
    await page.getByText('What would you like to learn?', { exact: true }).waitFor();
    await page.getByRole('navigation').getByRole('link', { name: 'Your Projects', exact: true }).click();
    await page.getByRole('link', { name: 'Test student idea', exact: true }).waitFor();
    await page.getByRole('navigation').getByRole('link', { name: 'Discover', exact: true }).click();
    await expectCards(6);
    await page.reload();
    await page.getByRole('heading', { level: 1 }).waitFor();
    await expectCards(5);
    await page.screenshot({ path: `test-results/discover-${viewport.width}.png`, fullPage: true });
    await page.goto(`${base}/projects/missing`);
    await page.getByRole('heading', { name: 'Opportunity not found' }).waitFor();
    await page.goto(`${base}/unknown`);
    await page.getByRole('heading', { name: "This page hasn't been built" }).waitFor();
    // Direct-link reload support for both teammate routes.
    for (const route of ['mentor-match', 'linkedin-export', 'profile', 'create', 'your-projects', 'saved', 'projects/demo-sprout']) {
      await page.goto(`${base}/${route}`);
      await page.getByRole('heading', { level: 1 }).waitFor();
    }
    console.log(`PASS: routes, search/filter, save/unsave, create, reset, missing pages at ${viewport.width}px`);
  }
  assert.deepEqual(errors, [], 'Browser errors');
  console.log('PASS: no browser runtime or console errors');
} finally {
  await browser.close();
}
