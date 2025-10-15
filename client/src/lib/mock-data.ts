export interface PrerequisiteGroup {
  type: 'and' | 'or';
  courses: (string | PrerequisiteGroup)[];
}

export type Prerequisites = PrerequisiteGroup | Record<string, never>;

export interface Course {
  id: string;
  title: string;
  code: string;
  credits: number;
  description: string;
  prerequisites: Prerequisites;
  semesters_offered: string[];
}

export interface DegreeProgram {
  name: string;
  courses: Course[];
}