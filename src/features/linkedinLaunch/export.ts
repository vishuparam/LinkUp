import type { LinkedInProfileKit, ProfileEntry } from './types';

function formatEntry(entry: ProfileEntry): string {
  return [
    entry.title, entry.organization, entry.role && `Role: ${entry.role}`, entry.dates,
    entry.location, entry.description, entry.skills.length ? `Skills: ${entry.skills.join(', ')}` : '',
    ...(entry.links || []).map(link => `${link.label}: ${link.url}`),
  ].filter(Boolean).join('\n');
}

export type KitSection = 'headline' | 'about' | 'experience' | 'projects' | 'skills' | 'honors' | 'volunteering' | 'mentorship' | 'suggestedPost';

export const sectionLabels: Record<KitSection, string> = {
  headline: 'Headline', about: 'About', experience: 'Experience', projects: 'Projects',
  skills: 'Skills', honors: 'Honors & Awards', volunteering: 'Volunteering / Nonprofit Work',
  mentorship: 'Mentorship & Learning', suggestedPost: 'Suggested First Post',
};

export function sectionText(kit: LinkedInProfileKit, section: KitSection): string {
  switch (section) {
    case 'headline': return kit.headline;
    case 'about': return kit.about;
    case 'experience': return kit.experience.map(formatEntry).join('\n\n');
    case 'projects': return kit.projects.map(formatEntry).join('\n\n');
    case 'skills': return kit.skills.join(', ');
    case 'honors': return kit.honors.map(h => [h.title, h.issuer, h.date, h.description].filter(Boolean).join('\n')).join('\n\n');
    case 'volunteering': return kit.volunteering.map(formatEntry).join('\n\n');
    case 'mentorship': return kit.mentorship.join('\n\n');
    case 'suggestedPost': return kit.suggestedPost;
  }
}

export function allSectionsText(kit: LinkedInProfileKit): string {
  return (Object.keys(sectionLabels) as KitSection[])
    .map(key => ({ label: sectionLabels[key], content: sectionText(kit, key) }))
    .filter(section => section.content)
    .map(section => `${section.label}\n${section.content}`)
    .join('\n\n---\n\n');
}

export async function copyText(text: string, clipboard: Pick<Clipboard, 'writeText'> | undefined = globalThis.navigator?.clipboard): Promise<void> {
  if (!clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
  await clipboard.writeText(text);
}
