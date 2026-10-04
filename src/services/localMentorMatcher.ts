import { mentorDirectory } from '../data/mentorDirectory.js';
import type { Mentor, MentorCategory, MentorMatch, MentorPreferences, MentorSearchInput, PreferredMentorType } from '../types/mentor.js';

// Whole words/phrases prevent "AI" from matching words such as "chair".
export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
const topics: Partial<Record<MentorCategory, string[]>> = {
  'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'computer vision', 'image classification', 'nlp', 'llm'],
  'Computer Science': ['technology', 'computer science', 'computing', 'algorithm', 'programming', 'computer architecture'],
  'Software Engineering': ['software', 'web', 'app', 'react', 'javascript', 'typescript', 'python', 'coding', 'frontend', 'backend', 'technical development'],
  'Cybersecurity': ['cybersecurity', 'security', 'cryptography', 'encryption'],
  'Data Science': ['data science', 'data analytics', 'statistics', 'statistical', 'bayesian', 'data analysis'],
  'Robotics': ['robotics', 'robot', 'robots', 'robotic', 'drone', 'autonomous', 'mechatronics'],
  'Electrical Engineering': ['electronics', 'electrical', 'circuits', 'circuit', 'sensor', 'sensors', 'semiconductors', 'control theory'],
  'Mechanical Engineering': ['mechanical', 'mechanics', 'cad', 'manufacturing', 'fluid', 'actuator'],
  'Biomedical Engineering': ['biomedical', 'bioengineering', 'biosensor', 'tissue engineering', 'prosthetic', 'microfluidics', 'medical imaging'],
  'Healthcare': ['healthcare', 'health', 'medical', 'medicine', 'cancer', 'diagnostics', 'disease', 'clinical', 'retinal'],
  'Medicine': ['medicine', 'clinical', 'neurology', 'psychiatry', 'oncology'],
  'Biology': ['biology', 'biological', 'cell', 'cells', 'genetics', 'genomics', 'microbial', 'bacteria', 'neuroscience', 'brain', 'protein'],
  'Chemistry': ['chemistry', 'chemical', 'molecular', 'spectroscopy', 'electrochemistry'],
  'Physics': ['physics', 'quantum', 'optics', 'thermal', 'acoustics'],
  'Environmental Science': ['environment', 'environmental', 'water', 'ecology', 'conservation', 'pollution', 'air quality', 'groundwater', 'ocean'],
  'Climate / Sustainability': ['climate', 'sustainability', 'sustainable', 'carbon', 'renewable', 'energy', 'solar', 'wind'],
  'Agriculture': ['agriculture', 'agricultural', 'farming', 'soil', 'plant', 'plants', 'crop', 'crops'],
  'Business': ['business', 'marketing', 'leadership', 'management', 'sales', 'supply chain'],
  'Entrepreneurship': ['entrepreneurship', 'entrepreneur', 'startup', 'startups', 'founder', 'venture', 'crowdfunding'],
  'Finance': ['finance', 'financial', 'fintech', 'investment', 'portfolio', 'credit', 'blockchain'],
  'Economics': ['economics', 'economic', 'inequality', 'macroeconomics'],
  'Education': ['education', 'educational', 'teaching', 'teacher', 'curriculum', 'learning sciences'],
  'Design': ['design', 'illustration', 'sketching'], 'UX': ['ux', 'user experience', 'human computer interaction', 'usability', 'haptics'],
  'Product Development': ['product development', 'product design', 'prototype', 'prototyping', 'user innovation'],
  'Social Impact': ['social impact', 'equity', 'community', 'nonprofit', 'responsible innovation'],
  'Public Health': ['public health', 'epidemiology', 'epidemic', 'infectious', 'pandemic'],
  'Mathematics': ['mathematics', 'math', 'optimization', 'differential equations', 'theory of computation'],
  'Materials Science': ['materials', 'biomaterials', 'polymers', 'nanomaterials', 'nanotechnology', 'battery', 'batteries'],
  'Civil Engineering': ['civil engineering', 'geotechnical', 'infrastructure', 'hydrology', 'foundation'],
};
function contains(text: string, phrase: string): boolean { return ` ${normalize(text)} `.includes(` ${normalize(phrase)} `); }
export function detectTopics(text: string): MentorCategory[] {
  return (Object.entries(topics) as [MentorCategory, string[]][]).filter(([, words]) => words.some(word => contains(text, word))).map(([category]) => category);
}
function coverage(wanted: string[], actual: string[]): number {
  return wanted.length ? wanted.filter(term => actual.includes(term)).length / wanted.length : 0;
}
const helpTopics: Record<string, MentorCategory[]> = {
  'Technical Development': ['Software Engineering', 'Computer Science', 'Electrical Engineering', 'Robotics'],
  'Research Methodology': ['Research'], 'Machine Learning / AI': ['Artificial Intelligence'],
  'Engineering': ['Mechanical Engineering', 'Electrical Engineering', 'Biomedical Engineering', 'Civil Engineering', 'Robotics'],
  'Product Design': ['Design', 'UX', 'Product Development'], 'Business / Entrepreneurship': ['Business', 'Entrepreneurship'],
  'Industry Knowledge': ['Business', 'Product Development', 'Computer Science', 'Electrical Engineering'],
  'Competition Preparation': ['Research', 'Mechanical Engineering', 'Electrical Engineering'], 'Project Planning': ['Business', 'Research'],
  'Scientific Research': ['Research', 'Biology', 'Chemistry', 'Physics'],
  'Healthcare / Scientific Research': ['Healthcare', 'Biomedical Engineering', 'Medicine', 'Public Health'],
  'Other': [],
};
export const helpAreas = Object.keys(helpTopics);
export function prioritizedHelpAreas(input: Pick<MentorSearchInput, 'title' | 'description' | 'category'>): string[] {
  const relevant = detectTopics(`${input.title} ${input.description} ${input.category}`);
  return [...helpAreas].sort((a, b) => Number((helpTopics[b] ?? []).some(t => relevant.includes(t))) - Number((helpTopics[a] ?? []).some(t => relevant.includes(t))));
}
function matchesType(mentor: Mentor, preference: PreferredMentorType): boolean {
  if (preference === 'any') return true;
  if (preference === 'academic') return ['professor', 'researcher'].includes(mentor.mentorType);
  if (preference === 'technical') return mentor.mentorType === 'engineer' || mentor.categories.some(c => ['Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Robotics', 'Computer Science'].includes(c));
  if (preference === 'founder') return mentor.mentorType === 'entrepreneur';
  if (preference === 'industry') return ['industry', 'engineer', 'entrepreneur'].includes(mentor.mentorType);
  return ['medical', 'scientist'].includes(mentor.mentorType) || mentor.categories.some(c => ['Medicine', 'Healthcare', 'Biology', 'Chemistry', 'Physics'].includes(c));
}
const stateAliases: Record<string, string> = { ma: 'massachusetts', il: 'illinois', ca: 'california', tx: 'texas', ny: 'new york', wa: 'washington', fl: 'florida', pa: 'pennsylvania', nj: 'new jersey', oh: 'ohio', mi: 'michigan', nc: 'north carolina', ga: 'georgia', va: 'virginia', co: 'colorado', az: 'arizona', md: 'maryland', mn: 'minnesota', wi: 'wisconsin', ct: 'connecticut', mo: 'missouri', tn: 'tennessee', in: 'indiana', or: 'oregon', ut: 'utah', dc: 'district of columbia' };
function stateName(state = '') { return stateAliases[normalize(state)] ?? normalize(state); }
function cityName(city = '') { const name = normalize(city); return name === 'champaign' ? 'urbana' : name; }
export function locationRelevance(mentor: Mentor, preferences: MentorPreferences): number {
  if (preferences.locationImportance === 'none') return 1; // Identical for everyone: no geographic ranking bias.
  const state = stateName(preferences.state);
  const sameState = !!state && state === stateName(mentor.location.state);
  const sameCity = !!preferences.city.trim() && cityName(preferences.city) === cityName(mentor.location.city) && (!state || sameState);
  return sameCity ? 1 : sameState ? 0.35 : 0;
}
const stopWords = new Set('the and for with from this that your project research development science help build building student students need needs needed using use study studies new a an to of in on is are as at by it our'.split(' '));
function terms(text: string): string[] { return [...new Set(normalize(text).split(' ').filter(t => t.length > 2 && !stopWords.has(t)))]; }

export function rankMentors(input: MentorSearchInput, directory: Mentor[] = mentorDirectory): MentorMatch[] {
  const p = input.preferences;
  const projectText = `${input.title} ${input.description} ${input.category} ${input.tags.join(' ')}`;
  const projectTopics = detectTopics(projectText);
  const coreTopics = detectTopics(input.category);
  const hasCoreMentors = directory.some(mentor => mentor.categories.some(category => coreTopics.includes(category)));
  const requiredTopics = detectTopics(input.skillsNeeded.join(' '));
  const currentTopics = detectTopics(input.currentSkills.join(' '));
  const requestedWords = terms(`${projectText} ${input.skillsNeeded.join(' ')} ${p.notes}`);
  const notesTopics = detectTopics(p.notes);
  const weights = p.locationImportance === 'important' ? [25, 23, 18, 9, 10, 15] : [30, 25, 20, 10, 10, 5];
  return directory.map((mentor): MentorMatch | null => {
    const location = locationRelevance(mentor, p);
    // In-person is a requirement, not a cosmetic bonus; never imply a distant professional is nearby.
    if ((!p.remoteAllowed || p.locationImportance === 'in-person') && (!p.city.trim() || location < 1)) return null;
    const actual = mentor.categories;
    if (hasCoreMentors && !actual.some(category => coreTopics.includes(category))) return null;
    const topic = coreTopics.length ? coverage(coreTopics, actual) * 0.65 + coverage(projectTopics, actual) * 0.35 : coverage(projectTopics, actual);
    if (!topic) return null; // No arbitrary people for unsupported subject areas.
    const explicitHelp = p.helpAreas.filter(area => (helpTopics[area] ?? []).length);
    const help = explicitHelp.length ? explicitHelp.filter(area => (helpTopics[area] ?? []).some(c => actual.includes(c))).length / explicitHelp.length : topic;
    const noteMatch = coverage(notesTopics, actual);
    const skills = requiredTopics.length ? coverage(requiredTopics, actual) * 0.8 + (currentTopics.length ? coverage(currentTopics, actual) : topic) * 0.2 : topic;
    const overlappingAreas = mentor.researchAreas.filter(area => terms(area).some(t => requestedWords.includes(t)) || detectTopics(area).some(t => projectTopics.includes(t)));
    const research = Math.min(1, overlappingAreas.length / 3);
    const breakdown = { topic: topic * 0.9 + (mentor.projectTypes.includes(input.projectType) ? topic * 0.1 : 0), help: notesTopics.length ? help * 0.8 + noteMatch * 0.2 : help, skills, research, type: matchesType(mentor, p.mentorType) ? 1 : 0, location };
    const values = Object.values(breakdown);
    const matchScore = Math.round(values.reduce((total, value, i) => total + value * (weights[i] ?? 0), 0));
    const matchingExpertise = overlappingAreas.slice(0, 3);
    const relevant = matchingExpertise.length ? matchingExpertise : actual.filter(t => projectTopics.includes(t)).slice(0, 3);
    const whyMatch = `Their published expertise in ${relevant.join(', ')} overlaps with the subjects described in your project${explicitHelp.length && help > 0 ? ' and your requested help areas' : ''}.`;
    return { mentor, matchScore, whyMatch, matchingExpertise: relevant, sources: [{ url: mentor.sourceUrl, name: mentor.sourceName, checkedOn: '2026-10-04' }], breakdown } satisfies MentorMatch;
  }).filter((match): match is MentorMatch => match !== null).sort((a, b) => b.matchScore - a.matchScore || b.breakdown.topic - a.breakdown.topic || b.breakdown.skills - a.breakdown.skills || b.breakdown.research - a.breakdown.research || a.mentor.id.localeCompare(b.mentor.id)).slice(0, 3);
}

