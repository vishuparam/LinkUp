import type { Opportunity, User } from '../types';

// All people and opportunities in this file are fictional.
export const demoUser: User = {
  id: 'demo-alex', name: 'Alex Rivera', grade: 11,
  bio: 'Learning by building. Interested in useful technology and projects that bring people together.',
  skills: ['React', 'Design', 'Writing'], interests: ['Technology', 'Environment'],
};

const maya: User = {
  id: 'demo-maya', name: 'Maya Chen', grade: 10,
  bio: 'Making science and creativity more accessible.',
  skills: ['Research', 'Illustration'], interests: ['Science', 'Education'],
};

export const demoOpportunities: Opportunity[] = [
  {
    id: 'demo-sprout', name: 'Sprout Map', type: 'Project',
    shortDescription: 'Help students find community gardens and grow something close to home.',
    fullDescription: 'We are designing a simple map of community gardens for students. Our first goal is a small working prototype with sample garden listings and clear, accessible directions. Join us to practice building a useful tool together.',
    field: 'Environment', skillsNeeded: ['React', 'Design'], rolesNeeded: ['Frontend developer', 'UI designer'],
    creator: demoUser, location: 'Austin, TX', remote: true,
    applicationQuestions: ['What would you like to help build?'],
  },
  {
    id: 'demo-science', name: 'Pocket Science', type: 'Nonprofit',
    shortDescription: 'Turn everyday materials into fun science activity guides for younger students.',
    fullDescription: 'This fictional student nonprofit creates illustrated science guides using accessible materials. We are looking for teammates to write activities, check explanations, and draw friendly diagrams.',
    field: 'Education', skillsNeeded: ['Writing', 'Illustration', 'Research'], rolesNeeded: ['Activity writer', 'Illustrator'],
    creator: maya, location: 'Chicago, IL', remote: true,
  },
  {
    id: 'demo-loop', name: 'Loop Studio', type: 'Company',
    shortDescription: 'Explore a student-run stationery company using reclaimed paper and original art.',
    fullDescription: 'Our demo company is exploring handmade notebooks from reclaimed paper. Help sketch product ideas, estimate material costs, and design a small catalog. This is a fictional team for testing LinkUp.',
    field: 'Art & business', skillsNeeded: ['Illustration', 'Marketing', 'Budgeting'], rolesNeeded: ['Product designer', 'Marketing collaborator'],
    creator: maya, location: 'Portland, OR', remote: false,
  },
  {
    id: 'demo-orbit', name: 'Orbit Study', type: 'Project',
    shortDescription: 'Build a friendly study timer with room for breaks, goals, and small wins.',
    fullDescription: 'We want to make a focused study timer that feels calm and easy to use. Our demo team needs students who enjoy coding, testing, or thinking about how a product should work.',
    field: 'Technology', skillsNeeded: ['JavaScript', 'Testing'], rolesNeeded: ['Developer', 'Product tester'],
    creator: maya, location: 'Boston, MA', remote: true,
    applicationQuestions: ['What makes a study tool helpful for you?'],
  },
  {
    id: 'demo-neighbor', name: 'Neighbor Notes', type: 'Nonprofit',
    shortDescription: 'Connect students through a community storytelling and oral history project.',
    fullDescription: 'This fictional nonprofit helps students practice interviewing and storytelling. We are planning a small collection of community stories with permission from every participant.',
    field: 'Community', skillsNeeded: ['Writing', 'Audio editing'], rolesNeeded: ['Story editor', 'Audio collaborator'],
    creator: demoUser, location: 'Austin, TX', remote: false,
  },
];
