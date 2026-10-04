import type { Opportunity, User } from '../../types';
import type { LinkedInLaunchSource } from './types';

/** Opportunities are ideas seeking teammates, not proof of employment or finished work. */
export function adaptLinkUpData(user: User, opportunities: Opportunity[]): LinkedInLaunchSource {
  return {
    id: user.id,
    name: user.name,
    bio: user.bio,
    skills: user.skills,
    interests: user.interests,
    projects: opportunities
      .filter(opportunity => opportunity.creator.id === user.id)
      .map(opportunity => ({
        id: opportunity.id,
        name: opportunity.name,
        status: 'idea' as const,
        description: opportunity.shortDescription,
      })),
  };
}
