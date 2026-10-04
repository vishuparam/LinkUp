import type { LinkedInLaunchSource } from './types';

/** Fictional fixture. Never import this into shared production user data. */
export const linkedInLaunchDemoUser: LinkedInLaunchSource = {
  id: 'demo-student',
  name: 'Jordan Lee',
  school: 'Riverside High School',
  educationLevel: 'High School',
  bio: 'I am a student interested in building useful technology and improving access to community resources.',
  interests: ['software development', 'community service'],
  skills: ['React', 'Python', 'Research', 'Public Speaking'],
  projects: [
    {
      id: 'demo-1', name: 'ResourceMap', role: 'Co-creator',
      description: 'Built a website that helps students find local food and tutoring resources.',
      startDate: '2025-09', isCurrent: true, technologies: ['React', 'TypeScript'],
      skills: ['User Research'],
      links: { website: 'https://example.org/resourcemap', github: 'https://github.com/example/resourcemap' },
    },
    {
      id: 'demo-2', name: 'StudyCircle', role: 'Developer',
      description: 'Created a prototype for organizing peer study groups.',
      startDate: '2024-11', endDate: '2025-03', technologies: ['Python'],
      links: { demo: 'https://example.org/studycircle' },
    },
  ],
  experiences: [
    {
      id: 'demo-4', title: 'Project Lead', organization: 'Riverside Coding Club',
      kind: 'leadership', description: 'Led a student team building small tools for school clubs.',
      startDate: '2024-09', endDate: '2025-05', skills: ['React', 'Public Speaking'],
    },
    {
      id: 'demo-3', title: 'Volunteer Coordinator', organization: 'Neighborhood Learning Club',
      kind: 'nonprofit', description: 'Organized weekly peer tutoring sessions.',
      startDate: '2025-01', isCurrent: true, skills: ['Public Speaking'],
    },
  ],
  honors: [{ title: 'Regional Student Innovation Finalist', issuer: 'Community Innovation Fair', date: '2025-05' }],
  mentors: [{ shareInExport: true, learningFocus: 'product design and user interviews', summary: 'Discussed ways to test early project ideas.' }],
};
