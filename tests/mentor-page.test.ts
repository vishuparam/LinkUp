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

it('fills mentor search fields from a project saved in this browser', () => {
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
  expect(page).toContain('Build a retinal image classifier and evaluate it with a research mentor.');
  expect(page).toContain('Computer vision, Research methods');
  expect(page).toContain('Chicago, Illinois');
});
