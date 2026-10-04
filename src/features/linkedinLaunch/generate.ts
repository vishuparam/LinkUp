import { cleanList, cleanText, dateRange, normalizeLinkedInSource, safeUrl } from './normalize';
import type { LinkedInLaunchSource, LinkedInProfileKit, ProfileEntry, SourceExperience, SourceProject } from './types';

const sentence = (text?: string): string => text ? /[.!?]$/.test(text) ? text : `${text}.` : '';
const joined = (...parts: (string | undefined)[]): string => parts.filter(Boolean).join(' ');
const cleanMultiline = (value: unknown): string => typeof value === 'string' ? value.split('\n').map(cleanText).join('\n').trim() : '';

function projectEntry(project: SourceProject): ProfileEntry {
  const links = ([['Website', project.links?.website], ['GitHub', project.links?.github], ['Demo', project.links?.demo]] as const)
    .flatMap(([label, url]) => url ? [{ label, url }] : []);
  return {
    title: project.name || '', role: project.role || undefined,
    dates: dateRange(project.startDate, project.endDate, project.isCurrent),
    description: joined(project.status === 'idea' ? 'Idea shared on LinkUp.' : undefined,
      sentence(project.description), project.impact ? `Impact: ${sentence(project.impact)}` : undefined,
      ...(project.achievements || []).map(achievement => `Achievement: ${sentence(achievement)}`)),
    skills: cleanList([...(project.skills || []), ...(project.technologies || [])]),
    links: links.length ? links : undefined,
  };
}

function experienceEntry(value: SourceExperience): ProfileEntry {
  return {
    title: value.title || value.organization || '', organization: value.organization || undefined,
    dates: dateRange(value.startDate, value.endDate, value.isCurrent), location: value.location || undefined,
    description: joined(sentence(value.description), ...(value.accomplishments || []).map(sentence)),
    skills: cleanList([...(value.skills || []), ...(value.technologies || [])]),
  };
}

function headline(source: LinkedInLaunchSource): string {
  const roles = cleanList((source.experiences || []).map(e => e.title).filter(Boolean)).slice(0, 2);
  const descriptors = roles.length ? roles : [source.educationLevel ? `${source.educationLevel} Student` : 'Student'];
  const interests = cleanList([...(source.interests || []), ...(source.skills || [])]).slice(0, 2);
  return [...descriptors, ...interests].join(' | ').slice(0, 220);
}

function about(source: LinkedInLaunchSource): string {
  const paragraphs: string[] = [];
  if (source.bio) {
    const school = source.school && !source.bio.toLocaleLowerCase().includes(source.school.toLocaleLowerCase())
      ? ` I study at ${source.school}.` : '';
    paragraphs.push(`${sentence(source.bio)}${school}`);
  }
  else {
    const intro = source.name ? `I'm ${source.name}, a student` : `I'm a student`;
    const school = source.school ? ` at ${source.school}` : '';
    const interests = (source.interests || []).slice(0, 3);
    paragraphs.push(`${intro}${school}${interests.length ? ` interested in ${interests.join(', ')}` : ''}.`);
  }
  const projects = (source.projects || []).slice(0, 2).map(p => p.name).filter(Boolean);
  if (projects.length) {
    const allIdeas = (source.projects || []).every(project => project.status === 'idea');
    paragraphs.push(`${allIdeas ? "Ideas I've shared on LinkUp" : 'My projects and ideas'} include ${projects.join(' and ')}.`);
  }
  const skills = (source.skills || []).slice(0, 4);
  if (skills.length) paragraphs.push(`Skills I've listed on LinkUp include ${skills.join(', ')}.`);
  return paragraphs.slice(0, 3).join('\n\n');
}

function suggestedPost(source: LinkedInLaunchSource): string {
  const name = source.name ? `I'm ${source.name}, ` : `I'm `;
  const interest = (source.interests || []).slice(0, 2);
  const first = `${name}a student${interest.length ? ` interested in ${interest.join(' and ')}` : ''}.`;
  const project = source.projects?.[0]?.name;
  const isIdea = source.projects?.[0]?.status === 'idea';
  return joined(first, project ? `${isIdea ? "I've shared an idea for" : "I've worked on"} ${project}, and I'm looking forward to sharing what I learn.` : `I'm looking forward to sharing what I learn.`);
}

/** Deterministic, offline generator. It only rephrases facts supplied by LinkUp. */
export function generateLinkedInProfile(input: LinkedInLaunchSource = {}): LinkedInProfileKit {
  const source = normalizeLinkedInSource(input);
  const experience = (source.experiences || []).filter(e => e.kind !== 'volunteer' && e.kind !== 'nonprofit').map(experienceEntry);
  const volunteering = (source.experiences || []).filter(e => e.kind === 'volunteer' || e.kind === 'nonprofit').map(experienceEntry);
  const skills = cleanList([
    ...(source.skills || []),
    ...(source.projects || []).flatMap(p => [...(p.skills || []), ...(p.technologies || [])]),
    ...(source.experiences || []).flatMap(e => [...(e.skills || []), ...(e.technologies || [])]),
  ]);
  const honors = (source.honors || []).map(h => ({
    title: h.title || '', issuer: h.issuer || undefined, date: h.date || undefined, description: h.description || undefined,
  }));
  const mentorship = (source.mentors || []).map(m => joined(
    m.learningFocus ? `Learning focus: ${sentence(m.learningFocus)}` : undefined,
    m.summary ? sentence(m.summary) : undefined,
    m.name ? `Mentor: ${m.name}${m.organization ? ` (${m.organization})` : ''}.` : undefined,
  )).filter(Boolean);
  const kit: LinkedInProfileKit = {
    headline: headline(source), about: about(source), experience,
    projects: (source.projects || []).map(projectEntry), skills, honors, volunteering, mentorship,
    suggestedPost: suggestedPost(source),
  };
  return validateLinkedInProfileKit(kit);
}

/** Shape and length checks also protect callers from a malformed future generator. */
export function validateLinkedInProfileKit(value: unknown): LinkedInProfileKit {
  const kit = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const entries = (input: unknown): ProfileEntry[] => Array.isArray(input) ? input.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const data = item as Record<string, unknown>;
    const title = cleanText(data.title);
    if (!title) return [];
    const links = Array.isArray(data.links) ? data.links.flatMap(link => {
      if (!link || typeof link !== 'object') return [];
      const entry = link as Record<string, unknown>;
      const label = cleanText(entry.label);
      const url = safeUrl(entry.url);
      return label && url ? [{ label, url }] : [];
    }) : [];
    return [{ title, organization: cleanText(data.organization) || undefined, role: cleanText(data.role) || undefined,
      dates: cleanText(data.dates) || undefined, location: cleanText(data.location) || undefined,
      description: cleanText(data.description), skills: cleanList(data.skills), links: links.length ? links : undefined }];
  }) : [];
  const honors = Array.isArray(kit.honors) ? kit.honors.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const data = item as Record<string, unknown>;
    const title = cleanText(data.title);
    return title ? [{ title, issuer: cleanText(data.issuer) || undefined, date: cleanText(data.date) || undefined,
      description: cleanText(data.description) || undefined }] : [];
  }) : [];
  return {
    headline: cleanText(kit.headline).slice(0, 220) || 'Student',
    about: cleanMultiline(kit.about),
    experience: entries(kit.experience), projects: entries(kit.projects),
    skills: cleanList(kit.skills), honors,
    volunteering: entries(kit.volunteering), mentorship: cleanList(kit.mentorship),
    suggestedPost: cleanText(kit.suggestedPost),
  };
}
