import type { LinkedInLaunchSource, SourceExperience, SourceHonor, SourceProject } from './types';

const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phone = /(?:\+?\d[\d ().-]{7,}\d)/g;

/** Keep only exportable fields and remove contact details from free text. */
export function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(email, '[contact removed]').replace(phone, '[contact removed]').replace(/\s+/g, ' ').trim();
}

export function cleanList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  return values.map(cleanText).filter(value => {
    const key = value.toLocaleLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function date(value: unknown): string {
  const text = cleanText(value);
  return /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(text) ? text : '';
}

export function dateRange(start?: string, end?: string, isCurrent?: boolean): string | undefined {
  if (start && (end || isCurrent)) return `${start} – ${isCurrent ? 'Present' : end}`;
  return start || end || undefined;
}

export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return undefined;
    return url.toString();
  } catch { return undefined; }
}

function project(value: SourceProject): SourceProject {
  return {
    id: cleanText(value.id), name: cleanText(value.name || value.title), role: cleanText(value.role),
    status: ['idea', 'in-progress', 'completed'].includes(value.status || '') ? value.status : undefined,
    category: cleanText(value.category), field: cleanText(value.field),
    description: cleanText(value.description), startDate: date(value.startDate), endDate: date(value.endDate),
    isCurrent: value.isCurrent === true, skills: cleanList(value.skills), technologies: cleanList(value.technologies),
    impact: cleanText(value.impact), achievements: cleanList(value.achievements), links: {
      website: safeUrl(value.links?.website), github: safeUrl(value.links?.github), demo: safeUrl(value.links?.demo),
    },
  };
}

function experience(value: SourceExperience): SourceExperience {
  const kind = ['company', 'nonprofit', 'volunteer', 'leadership', 'other'].includes(value.kind || '') ? value.kind : 'other';
  return {
    id: cleanText(value.id), title: cleanText(value.title || value.role), organization: cleanText(value.organization), kind,
    description: cleanText(value.description), accomplishments: cleanList(value.accomplishments),
    startDate: date(value.startDate), endDate: date(value.endDate), isCurrent: value.isCurrent === true,
    location: cleanText(value.location), skills: cleanList(value.skills), technologies: cleanList(value.technologies),
  };
}

function honor(value: SourceHonor): SourceHonor {
  return { title: cleanText(value.title), issuer: cleanText(value.issuer), date: date(value.date), description: cleanText(value.description) };
}

export function normalizeLinkedInSource(source: LinkedInLaunchSource = {}): LinkedInLaunchSource {
  return {
    id: cleanText(source.id), name: cleanText(source.name),
    grade: Number.isInteger(source.grade) && source.grade! >= 1 && source.grade! <= 12 ? source.grade : undefined,
    school: cleanText(source.school),
    educationLevel: cleanText(source.educationLevel), bio: cleanText(source.bio),
    interests: cleanList(source.interests), goals: cleanList(source.goals), skills: cleanList(source.skills),
    projects: (Array.isArray(source.projects) ? source.projects : []).filter(Boolean).map(project).filter(p => p.name),
    experiences: (Array.isArray(source.experiences) ? source.experiences : []).filter(Boolean).map(experience).filter(e => e.title || e.organization),
    honors: [...(Array.isArray(source.honors) ? source.honors : []), ...(Array.isArray(source.achievements) ? source.achievements : [])]
      .filter(Boolean).map(honor).filter(h => h.title),
    mentors: (Array.isArray(source.mentors) ? source.mentors : []).filter(m => m?.shareInExport === true).map(m => ({
      shareInExport: true, name: cleanText(m.name), organization: cleanText(m.organization),
      learningFocus: cleanText(m.learningFocus), summary: cleanText(m.summary),
    })),
  };
}
