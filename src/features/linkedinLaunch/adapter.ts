import type { Opportunity, User } from '../../types';
import type { LinkedInLaunchSource } from './types';

/** Opportunities are ideas seeking teammates, not proof of employment or finished work. */
export function getSelectableOpportunities(user: User, opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter(opportunity => opportunity.creator.id === user.id);
}

function projectDescription(opportunity: Opportunity): string {
  const summary = opportunity.shortDescription.trim();
  const details = opportunity.fullDescription.split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(part => part && !/\b(join us|we are looking for|looking for teammates|our demo team needs|help us)\b/i.test(part))
    .filter(part => part.toLocaleLowerCase() !== summary.toLocaleLowerCase())
    .slice(0, 2);
  return [summary, ...details].filter(Boolean).join(' ');
}

export function adaptLinkUpData(
  user: User,
  opportunities: Opportunity[],
  selectedProjectIds: readonly string[],
): LinkedInLaunchSource {
  const selected = new Set(selectedProjectIds);
  return {
    id: user.id,
    name: user.name,
    grade: user.grade,
    bio: user.bio,
    skills: user.skills,
    interests: user.interests,
    projects: getSelectableOpportunities(user, opportunities)
      .filter(opportunity => selected.has(opportunity.id))
      .map(opportunity => ({
        id: opportunity.id,
        name: opportunity.name,
        status: 'idea' as const,
        category: opportunity.type,
        field: opportunity.field,
        description: projectDescription(opportunity),
      })),
  };
}
