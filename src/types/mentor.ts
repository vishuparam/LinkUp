export type MentorCategory = 'Artificial Intelligence' | 'Computer Science' | 'Software Engineering' | 'Cybersecurity' | 'Data Science' | 'Robotics' | 'Electrical Engineering' | 'Mechanical Engineering' | 'Biomedical Engineering' | 'Healthcare' | 'Medicine' | 'Biology' | 'Chemistry' | 'Physics' | 'Environmental Science' | 'Climate / Sustainability' | 'Agriculture' | 'Business' | 'Entrepreneurship' | 'Finance' | 'Economics' | 'Education' | 'Design' | 'UX' | 'Product Development' | 'Research' | 'Social Impact' | 'Public Health' | 'Mathematics' | 'Materials Science' | 'Civil Engineering';
export type MentorType = 'professor' | 'researcher' | 'engineer' | 'entrepreneur' | 'industry' | 'medical' | 'scientist' | 'other';
export interface MentorSource { url: string; name: string; checkedOn?: string }
export interface Mentor {
  id: string; name: string; role: string; organization: string; mentorType: MentorType;
  categories: MentorCategory[]; skills: string[]; researchAreas: string[]; projectTypes: string[];
  location: { city?: string; state?: string; country?: string }; remoteFriendly?: boolean;
  description: string; profileUrl: string; contactUrl?: string; publicEmail?: string;
  sourceUrl: string; sourceName: string;
}
export type LocationImportance = 'none' | 'nearby' | 'important' | 'in-person';
export type PreferredMentorType = 'any' | 'academic' | 'technical' | 'founder' | 'industry' | 'medical';
export interface MentorPreferences {
  helpAreas: string[]; mentorType: PreferredMentorType; locationImportance: LocationImportance;
  city: string; state: string; remoteAllowed: boolean; notes: string;
}
export interface MentorSearchInput {
  title: string; description: string; category: string; currentSkills: string[];
  skillsNeeded: string[]; tags: string[]; projectType: string; preferences: MentorPreferences;
}
export interface MentorMatch {
  mentor: Mentor; matchScore: number; whyMatch: string; matchingExpertise: string[];
  sources: MentorSource[]; breakdown: { topic: number; help: number; skills: number; research: number; type: number; location: number };
}
export interface MentorSearchResult { mentors: MentorMatch[]; mode: 'local' | 'live'; message: string }
