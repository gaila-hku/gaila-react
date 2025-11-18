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
  order_index: number;
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
  assignment_id: number;
  student: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  submissions: {
    id: number;
    stage_id: number;
    stage_type: string;
    // content: string | null;
    submitted_at: number | null;
    is_final: boolean | null;
    score: number | null;
  }[];
}

export interface AssignmentRecentSubmissionListingItem
  extends AssignmentSubmissionListingItem {
  title: string;
}

export interface AssignmentGrade {
  id: number;
  submission_id: number;
  overall_score: number;
  overall_feedback: string;
  rubrics_breakdown: Record<string, number | null>;
  graded_at: number;
  graded_by: number;
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

export interface AssignmentSubmissionDetails {
  id: number;
  assignment: {
    id: number;
    title: string;
    description: string;
    start_date?: number;
    due_date: number;
    type: string;
    rubrics?: RubricItem[];
  };
  stages: AssignmentStage[];
  student: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  teacher_grading_tool_id: number;
  submissions: {
    id: number;
    stage_id: number;
    stage_type: string;
    content:
      | AssignmentGoal[]
      | AssignmentEssayContent
      | AssignmentReflectionContent;
    submitted_at: number;
    is_final: boolean;
    grade?: Pick<
      AssignmentGrade,
      'overall_score' | 'overall_feedback' | 'graded_at' | 'rubrics_breakdown'
    >;
  }[];
}

export interface AssignmentAnalytics {
  prompt_count: number;
  nature_counts: {
    [nature: string]: number;
  };
  aspect_counts: {
    [aspect: string]: number;
  };
  tool_counts: {
    [tool: string]: number;
  };
}
