export interface User {
  id: string;
  name: string;
  grade: number;
  bio: string;
  skills: string[];
  interests: string[];
}

export type OpportunityType = 'Project' | 'Nonprofit' | 'Company';

export interface Opportunity {
  id: string;
  name: string;
  type: OpportunityType;
  shortDescription: string;
  fullDescription: string;
  field: string;
  skillsNeeded: string[];
  rolesNeeded: string[];
  creator: User;
  location: string;
  remote: boolean;
  applicationQuestions?: string[];
}
