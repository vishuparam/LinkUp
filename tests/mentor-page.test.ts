import { afterEach, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DemoProvider } from '../src/context/DemoContext.js';
import { MentorMatch } from '../src/pages/MentorMatch.js';

vi.mock('framer-motion', () => ({
  motion: { button: 'button' },
  useReducedMotion: () => true,
}));

afterEach(() => vi.unstubAllGlobals());

it('offers a project saved in this browser in the mentor selector', () => {
  const stored = [{
    id: 'demo-retinal', name: 'Retinal AI research', type: 'Project',
    shortDescription: 'Detect retinal disease.',
    fullDescription: 'Build a retinal image classifier and evaluate it with a research mentor.',
    field: 'Medical AI', skillsNeeded: ['Computer vision', 'Research methods'],
    rolesNeeded: ['Researcher'], location: 'Chicago, Illinois', remote: true,
  }];
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {getItem: () => JSON.stringify(stored), setItem: vi.fn()});
  const page = renderToStaticMarkup(createElement(MemoryRouter, {initialEntries: ['/mentor-match?projectId=demo-retinal']},
    createElement(DemoProvider, null, createElement(MentorMatch))));
  expect(page).toContain('Retinal AI research');
  expect(page).toContain('id="mentor-project"');
  expect(page).toContain('value="demo-retinal"');
  expect(page).toContain('Choose a project');
  expect(page).toContain('Find mentors');
});
