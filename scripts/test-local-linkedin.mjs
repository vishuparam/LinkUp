import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.LINKUP_TEST_BASE || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel:'chrome', headless:true });
const context = await browser.newContext({ permissions:['clipboard-read','clipboard-write'] });
const page = await context.newPage();
const errors = []; let apiRequests = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('console', message => { if (message.type()==='error') errors.push(message.text()); });
await page.route('**/api/**', route => { apiRequests++; return route.abort(); });
await mkdir('test-results',{recursive:true});
async function noOverflow() { assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Horizontal overflow'); }
async function audit(label) { await page.waitForTimeout(350); const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); assert.deepEqual(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],label); }
async function generate(checkStages=false) {
  if(checkStages) await page.evaluate(() => { window.__llStages = []; window.__llObserver = new MutationObserver(() => { const text = document.querySelector('.ll-loading>p')?.textContent; if(text && !window.__llStages.includes(text)) window.__llStages.push(text); }); window.__llObserver.observe(document.body, {subtree:true, childList:true, characterData:true}); });
  const started=Date.now(); await page.getByRole('button',{name:'Generate LinkedIn Profile',exact:true}).click();
  await page.locator('.ll-loading').waitFor(); assert.equal(await page.locator('.ll-kit').count(),0);
    await page.getByRole('heading',{name:'Your LinkedIn Profile Kit',exact:true}).waitFor();
  if(checkStages) { const messages=await page.evaluate(() => { window.__llObserver.disconnect(); return window.__llStages; }); assert.equal(messages.length,3,JSON.stringify(messages)); }
  assert(Date.now()-started>=1500,'Loading transition is visible');
  assert.equal(await page.locator('.ll-kit-section').count(),5);
  await page.waitForTimeout(350);await noOverflow();
}
try {
  await page.setViewportSize({width:1440,height:950}); await page.goto(base+'/linkedin-export');
  const button=page.getByRole('button',{name:'Generate LinkedIn Profile',exact:true});
  assert.equal(await button.isEnabled(),false);
  const optionValues=await page.locator('#ll-interest option').evaluateAll(options=>options.map(o=>o.value).filter(Boolean));
  assert.equal(optionValues.length,10);
  const suggestionSets=new Set();
  for(const interest of optionValues){await page.locator('#ll-interest').selectOption(interest);assert.equal(await page.locator('.ll-project').count(),3);suggestionSets.add((await page.locator('.ll-project strong').allTextContents()).join('|'));}
  assert.equal(suggestionSets.size,10);
  await page.locator('#ll-interest').selectOption('engineering');
  for(const skill of ['Programming','Engineering Design','Problem Solving'])await page.getByRole('button',{name:skill,exact:true}).click();
  assert.equal(await button.isEnabled(),false);
  await page.getByRole('radio',{name:/Smart Irrigation System/}).check();assert.equal(await button.isEnabled(),true);
  await audit('Desktop selection'); await page.screenshot({path:'test-results/linkedin-local-selection-1440.png',fullPage:true});
  await generate(true);
  assert.match(await page.locator('.ll-section-headline>p').innerText(),/Student Engineer/);
  assert.match(await page.locator('.ll-section-about>p').innerText(),/Smart Irrigation System/);
  assert.deepEqual(await page.locator('.ll-result-skills .tag').allTextContents(),['Programming','Engineering Design','Problem Solving']);
  for(const label of ['Headline','About','Featured Project','Skills','Suggested First Post']) {
    const copy=page.getByRole('button',{name:'Copy '+label,exact:true});await copy.click();
    await page.waitForFunction(name => [...document.querySelectorAll('.ll-copy')].some(el=>el.getAttribute('aria-label')==='Copy '+name && el.textContent==='Copied!'), label);
    const text=await page.evaluate(()=>navigator.clipboard.readText());assert(text.length>20,'Nonempty clipboard for '+label);assert.equal(await copy.innerText(),'Copied!');
  }
  await page.getByRole('button',{name:'Copy All',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.ll-kit-actions button')?.textContent==='Copied!');
  const all=(await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n');
  for(const label of ['Headline','About','Featured Project','Skills','Suggested First Post'])assert(all.includes(label+'\n'));
  assert.match(all,/Smart Irrigation System/);assert.doesNotMatch(all,/Honors|Awards|Volunteering|Mentorship/);
  assert.equal(await page.getByRole('link',{name:/Open LinkedIn/}).getAttribute('href'),'https://www.linkedin.com/');
  assert.equal(await page.getByRole('link',{name:/Open LinkedIn/}).getAttribute('target'),'_blank');
  await audit('Desktop profile kit');await page.screenshot({path:'test-results/linkedin-local-results-1440.png',fullPage:true});
  // Changing the project replaces every project-specific section after another transition.
  await page.getByRole('radio',{name:/Energy-Efficient Model Home/}).check();assert.equal(await page.locator('.ll-kit').count(),0);await generate();
  assert.match(await page.locator('.ll-section-about>p').innerText(),/Energy-Efficient Model Home/);
  assert.doesNotMatch(await page.locator('.ll-kit').innerText(),/Smart Irrigation System/);
  await page.getByRole('button',{name:'Programming',exact:true}).click();await generate();
  assert.deepEqual(await page.locator('.ll-result-skills .tag').allTextContents(),['Engineering Design','Problem Solving']);
  // Changing interests resets project selection and replaces field-specific text.
  await page.locator('#ll-interest').selectOption('chemistry');assert.equal(await page.locator('.ll-kit').count(),0);assert.equal(await button.isEnabled(),false);
  await page.getByRole('radio',{name:/Everyday Materials Comparison/}).check();await page.getByRole('button',{name:'Scientific Research',exact:true}).click();await generate();
  assert.match(await page.locator('.ll-section-headline>p').innerText(),/Chemistry/);
  assert.match(await page.locator('.ll-section-about>p').innerText(),/chemistry/);
  assert.match(await page.locator('.ll-section-suggestedPost>p').innerText(),/Everyday Materials Comparison/);
  assert.doesNotMatch(await page.locator('.ll-kit').innerText(),/Student Engineer|Smart Irrigation|Model Home/);
  // Validate touch-sized layouts and reduced motion with working generation.
  for(const width of [768,390]) {
    await page.setViewportSize({width,height:950});await page.reload();
    await page.locator('#ll-interest').selectOption('software');await page.getByRole('button',{name:'React',exact:true}).click();await page.getByRole('radio',{name:/Student Study Planner/}).check();await noOverflow();
    if(width===390)await page.emulateMedia({reducedMotion:'reduce'});
    await generate();await audit('Profile kit '+width);await page.screenshot({path:`test-results/linkedin-local-results-${width}.png`,fullPage:true});
    if(width===390){await button.click();await page.locator('.ll-loading').waitFor();assert.equal(await page.locator('.ll-dots span').first().evaluate(el=>getComputedStyle(el).animationName),'none');await page.getByRole('heading',{name:'Your LinkedIn Profile Kit'}).waitFor();}
  }
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('blocked'))}}));
  await page.getByRole('button',{name:'Copy Headline',exact:true}).click();await page.getByRole('alert').filter({hasText:'copy it manually'}).waitFor();
  await page.goto(base+'/mentor-match');await page.getByRole('heading',{level:1,name:'Mentor Match'}).waitFor();await page.getByRole('button',{name:'Find mentors',exact:true}).waitFor();
  await page.goto(base+'/discover');await page.getByRole('heading',{level:1}).waitFor();await noOverflow();
  assert.equal(apiRequests,0,'No API calls');assert.deepEqual(errors,[],'No runtime/console errors');
  console.log('PASS: 10 interests/30 projects, selection validation, all loading stages, five kit sections, real clipboard/Copy All, project/skill/interest regeneration, clipboard failure, reduced motion, accessibility, 1440/768/390 layouts, Mentor Match/Discover routes. ZERO API requests.');
} finally { await browser.close(); }
