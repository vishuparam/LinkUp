const clean = value => typeof value === 'string' ? value.trim() : '';
const range = item => item.startDate
  ? `${item.startDate}${item.isCurrent ? ' – Present' : item.endDate ? ` – ${item.endDate}` : ''}`
  : item.endDate || undefined;
const unique = values => [...new Map(values.filter(Boolean).map(value => [value.toLocaleLowerCase(), value])).values()];

function verifyProse(value, evidence, limit) {
  if (!clean(value) || value.length > limit) throw new Error('AI text missing or too long');
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)) throw new Error('AI text contains contact information');
  const knownNumbers = new Set((evidence.match(/\b\d[\d,]*(?:\.\d+)?\b/g) || []).map(number => number.replaceAll(',', '')));
  for (const number of value.match(/\b\d[\d,]*(?:\.\d+)?\b/g) || []) {
    if (!knownNumbers.has(number.replaceAll(',', ''))) throw new Error('AI text introduced a number');
  }
  const claims = ['founder', 'co-founder', 'founded', 'led', 'managed', 'raised', 'served', 'award', 'winner', 'intern', 'internship', 'revenue', 'funding', 'launched', 'built', 'developed', 'created', 'leader', 'visionary'];
  for (const claim of claims) {
    if (new RegExp(`\\b${claim}\\b`, 'i').test(value) && !new RegExp(`\\b${claim}\\b`, 'i').test(evidence)) {
      throw new Error('AI text introduced an unsupported claim');
    }
  }
  return value.trim();
}

function entry(item, description) {
  return {
    title: item.title || item.organization,
    organization: item.organization || undefined,
    dates: range(item), location: item.location || undefined,
    description, skills: unique([...(item.skills || []), ...(item.technologies || [])]),
  };
}

/** Keep all factual fields tied to the sanitized source; AI supplies prose only. */
export function assembleProfileKit(profile, draft) {
  if (!draft || typeof draft !== 'object') throw new Error('Malformed AI output');
  const projects = profile.projects;
  const experience = profile.experiences.filter(item => item.kind !== 'nonprofit' && item.kind !== 'volunteer');
  const volunteering = profile.experiences.filter(item => item.kind === 'nonprofit' || item.kind === 'volunteer');
  if (!Array.isArray(draft.projects) || draft.projects.length !== projects.length ||
      !Array.isArray(draft.experienceDescriptions) || draft.experienceDescriptions.length !== experience.length ||
      !Array.isArray(draft.volunteeringDescriptions) || draft.volunteeringDescriptions.length !== volunteering.length ||
      !Array.isArray(draft.skills)) throw new Error('AI output did not match supplied records');
  const evidence = JSON.stringify(profile);
  const allowedSkills = unique([
    ...profile.skills,
    ...projects.flatMap(item => [...item.skills, ...item.technologies]),
    ...profile.experiences.flatMap(item => [...item.skills, ...item.technologies]),
  ]);
  const allowedKeys = new Set(allowedSkills.map(skill => skill.toLocaleLowerCase()));
  if (draft.skills.some(skill => typeof skill !== 'string' || !allowedKeys.has(skill.toLocaleLowerCase()))) {
    throw new Error('AI output introduced unsupported skills');
  }
  const projectEntries = projects.map((item, index) => {
    if (draft.projects[index]?.id !== item.id) throw new Error('AI output changed selected projects');
    // A project description must not borrow achievements or numbers from another project.
    const description = verifyProse(draft.projects[index].description, JSON.stringify(item), 1800);
    if (item.status === 'idea' && !/\b(idea|planned|planning|exploring|proposed|concept)\b/i.test(description)) {
      throw new Error('AI output presented an idea as completed work');
    }
    const links = Object.entries(item.links).filter(([, url]) => url).map(([label, url]) => ({ label: label === 'github' ? 'GitHub' : label[0].toUpperCase() + label.slice(1), url }));
    return {
      title: item.name, role: item.role || undefined, dates: range(item), description,
      skills: unique([...item.skills, ...item.technologies]), links: links.length ? links : undefined,
    };
  });
  const mentorText = profile.mentors.map(item => [
    item.learningFocus ? `Learning focus: ${item.learningFocus}` : '', item.summary,
    item.name ? `Mentor: ${item.name}${item.organization ? ` (${item.organization})` : ''}` : '',
  ].filter(Boolean).join('. ')).filter(Boolean);
  return {
    headline: verifyProse(draft.headline, evidence, 220),
    about: verifyProse(draft.about, evidence, 5000),
    experience: experience.map((item, index) => entry(item, verifyProse(draft.experienceDescriptions[index], evidence, 1800))),
    projects: projectEntries,
    skills: unique(draft.skills),
    honors: profile.honors.map(item => ({ title: item.title, issuer: item.issuer || undefined, date: item.date || undefined, description: item.description || undefined })),
    volunteering: volunteering.map((item, index) => entry(item, verifyProse(draft.volunteeringDescriptions[index], evidence, 1800))),
    mentorship: mentorText,
    suggestedPost: verifyProse(draft.suggestedPost, evidence, 1200),
  };
}
