/** Feature-local export contract. The adapter maps LinkUp models into this shape. */
export interface LinkedInLaunchSource {
  id?: string;
  name?: string;
  school?: string;
  educationLevel?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
  projects?: SourceProject[];
  experiences?: SourceExperience[];
  honors?: SourceHonor[];
  achievements?: SourceHonor[];
  mentors?: SourceMentor[];
}

export interface SourceProject {
  id?: string;
  name?: string;
  title?: string;
  role?: string;
  status?: 'idea' | 'in-progress' | 'completed';
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  skills?: string[];
  technologies?: string[];
  impact?: string;
  achievements?: string[];
  links?: { website?: string; github?: string; demo?: string };
}

export interface SourceExperience {
  id?: string;
  title?: string;
  role?: string;
  organization?: string;
  kind?: 'company' | 'nonprofit' | 'volunteer' | 'leadership' | 'other';
  description?: string;
  accomplishments?: string[];
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  skills?: string[];
  technologies?: string[];
}

export interface SourceHonor {
  title?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

/** Only explicitly shareable mentor facts are exported. Contact fields are never read. */
export interface SourceMentor {
  shareInExport?: boolean;
  name?: string;
  organization?: string;
  learningFocus?: string;
  summary?: string;
}

export interface ProfileEntry {
  title: string;
  organization?: string;
  role?: string;
  dates?: string;
  location?: string;
  description?: string;
  skills: string[];
  links?: { label: string; url: string }[];
}

export interface HonorEntry {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface LinkedInProfileKit {
  headline: string;
  about: string;
  experience: ProfileEntry[];
  projects: ProfileEntry[];
  skills: string[];
  honors: HonorEntry[];
  volunteering: ProfileEntry[];
  mentorship: string[];
  suggestedPost: string;
}
