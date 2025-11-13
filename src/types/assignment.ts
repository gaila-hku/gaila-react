import type { ClassOption } from 'types/class';
import type { ListingResponse } from 'types/response';
import type { UserOption } from 'types/user';

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  start_date?: number | null;
  due_date?: number | null;
  type?: string;
  instructions?: string;
  tips?: string[];
  requirements?: {
    min_word_count?: number | null;
    max_word_count?: number | null;
  };
  rubrics?: RubricItem[];
  stages: AssignmentStage[];
}

export interface RubricItem {
  criteria: string;
  description: string;
  max_points: number;
}

export type AssignmentListingResponse = ListingResponse<
  StudentAssignmentListingItem | TeacherAssignmentListingItem
>;

export interface StudentAssignmentListingItem extends Assignment {
  word_count: number;
  last_modified: string;
  status: 'upcoming' | 'in-progress' | 'submitted' | 'graded' | 'past-due';
}

export interface AssignmentDetails extends Assignment {
  enrolled_classes: ClassOption[];
  enrolled_students: UserOption[];
}

export interface AssignmentStage {
  id: number;
  stage_type: string;
  enabled: boolean;
  tools: { id: number; key: string; enabled: boolean }[];
}

export interface AssignmentProgress {
  assignment: Assignment;
  stages: (AssignmentStage & {
    submission: AssignmentSubmission | null;
    grade: AssignmentGrade | null;
  })[];
  current_stage: number;
  is_finished: boolean;
}

export interface AssignmentGoal {
  category: string;
  goals: {
    text: string;
    completed?: boolean;
  }[];
}

export interface AssignmentEssayContent {
  title: string;
  content: string;
  goals: AssignmentGoal[];
}

export interface AssignmentReflectionContent {
  [key: number]: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  stage_id: number;
  student_id: number;
  content:
    | AssignmentGoal[]
    | AssignmentEssayContent
    | AssignmentReflectionContent;
  submitted_at?: number;
  is_final?: boolean;
}

export interface AssignmentSubmissionListingItem {
  id: number;
  assignment_id: number;
  submitted_at?: number;
  is_final?: boolean;
  score?: number;
  stage: {
    id: number;
    stage_type: string;
  };
  student: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface AssignmentRecentSubmissionListingItem
  extends AssignmentSubmissionListingItem {
  title: string;
}

export interface AssignmentGrade {
  id: number;
  submission_id: number;
  score: number;
  score_breakdown?: {
    criteria: string;
    score: number;
    max_score: number;
    feedback: string;
  }[];
  feedback?: string;
  graded_at?: number;
  graded_by: string;
}

// TODO: total students
// TODO: submissions
// TODO: graded
// TODO: avgScore
export interface TeacherAssignmentListingItem extends Assignment {
  total_students: number;
  submitted: number;
  graded: number;
  avgScore: number | null;
  status: 'upcoming' | 'active' | 'past-due';
}
