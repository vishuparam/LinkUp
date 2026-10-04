const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phone = /(?:\+?\d[\d ().-]{7,}\d)/g;
const text = (value, limit = 1000) => typeof value === 'string'
  ? value.replace(email, '[contact removed]').replace(phone, '[contact removed]').replace(/\s+/g, ' ').trim().slice(0, limit)
  : '';
const list = (value, limit = 30) => Array.isArray(value)
  ? [...new Set(value.map(item => text(item, 120)).filter(Boolean))].slice(0, limit)
  : [];
const records = (value, limit) => Array.isArray(value) ? value.filter(item => item && typeof item === 'object').slice(0, limit) : [];
const date = value => /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(text(value, 10)) ? text(value, 10) : '';
const url = value => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.toString() : '';
  } catch { return ''; }
};

/** Whitelist the only facts allowed to leave the LinkUp server for AI generation. */
export function sanitizeProfile(input) {
  const raw = input && typeof input === 'object' ? input : {};
  const profile = {
    name: text(raw.name, 120),
    bio: text(raw.bio, 1500),
    interests: list(raw.interests), goals: list(raw.goals, 5), skills: list(raw.skills),
    projects: records(raw.projects, 12).map((item, index) => ({
      id: text(item.id, 100) || `project-${index}`,
      name: text(item.name || item.title, 160),
      category: text(item.category, 80), field: text(item.field, 80),
      status: ['idea', 'in-progress', 'completed'].includes(item.status) ? item.status : '',
      role: text(item.role, 120), description: text(item.description, 2500),
      startDate: date(item.startDate), endDate: date(item.endDate), isCurrent: item.isCurrent === true,
      skills: list(item.skills), technologies: list(item.technologies),
      impact: text(item.impact, 500), achievements: list(item.achievements, 10),
      links: { website: url(item.links?.website), github: url(item.links?.github), demo: url(item.links?.demo) },
    })).filter(item => item.name),
    experiences: records(raw.experiences, 12).map(item => ({
      title: text(item.title || item.role, 120), organization: text(item.organization, 160),
      kind: ['company', 'nonprofit', 'volunteer', 'leadership', 'other'].includes(item.kind) ? item.kind : 'other',
      description: text(item.description, 2000), accomplishments: list(item.accomplishments, 10),
      startDate: date(item.startDate), endDate: date(item.endDate), isCurrent: item.isCurrent === true,
      location: text(item.location, 160), skills: list(item.skills), technologies: list(item.technologies),
    })).filter(item => item.title || item.organization),
    honors: records([...(Array.isArray(raw.honors) ? raw.honors : []), ...(Array.isArray(raw.achievements) ? raw.achievements : [])], 20)
      .map(item => ({ title: text(item.title, 160), issuer: text(item.issuer, 160), date: date(item.date), description: text(item.description, 500) }))
      .filter(item => item.title),
    mentors: records(raw.mentors, 10).filter(item => item.shareInExport === true).map(item => ({
      name: text(item.name, 120), organization: text(item.organization, 160),
      learningFocus: text(item.learningFocus, 500), summary: text(item.summary, 800),
    })),
  };
  const grade = Number.isInteger(raw.grade) && raw.grade >= 1 && raw.grade <= 12 ? raw.grade : undefined;
  if (grade !== undefined) profile.grade = grade;
  const school = text(raw.school, 160);
  if (school) profile.school = school;
  const educationLevel = text(raw.educationLevel, 80);
  if (educationLevel) profile.educationLevel = educationLevel;
  return profile;
}
