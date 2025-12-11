import type { ClassOption } from 'types/class';
import type { StudentReminder } from 'types/reminder';
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
  config?: {
    outline_enabled?: boolean;
    revision_enabled?: boolean;
    dashboard?: {
      enabled?: boolean;
      word_count?: boolean;
      goal_progress?: boolean;
      complexity_scores?: boolean;
      accuracy_scores?: boolean;
      copying_detector?: boolean;
      prompt_category_nature?: boolean;
      prompt_category_aspect?: boolean;
      agent_usage?: boolean;
      writing_insights?: boolean;
    };
    reflection_questions?: string[];
  };
  requirements?: {
    min_word_count?: number | null;
    max_word_count?: number | null;
    title?: boolean;
  };
  rubrics?: RubricItem[];
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
  stages: AssignmentStage[];
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

export interface AssignmentGoalContent {
  writing_goals: AssignmentGoal[];
  ai_goals: AssignmentGoal[];
  goal_confirmed: boolean;
}

export interface AssignmentGoal {
  goalText: string;
  strategies: {
    text: string;
    completed?: boolean;
  }[];
}

export interface AssignmentEssayContent {
  title: string;
  outline: string;
  essay: string;
  goals: AssignmentGoalContent | null;
  outline_confirmed: boolean;
  draft_confirmed: boolean;
}

export interface AssignmentReflectionContent {
  reflections: { [key: string]: string };
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  stage_id: number;
  student_id: number;
  content:
    | AssignmentGoalContent
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

export interface TeacherAssignmentListingItem extends Assignment {
  student_count: number;
  submitted_count: number;
  graded_count: number;
  avg_score: number | null;
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
      | AssignmentGoalContent
      | AssignmentEssayContent
      | AssignmentReflectionContent;
    submitted_at: number;
    is_final: boolean;
    grade?: Pick<
      AssignmentGrade,
      'overall_score' | 'overall_feedback' | 'graded_at' | 'rubrics_breakdown'
    >;
  }[];
  analytics: AssignmentAnalytics;
  engagement: {
    last_ai_use: number | null;
    last_dashboard_use: number | null;
  };
  last_reminders: { [key: string]: StudentReminder | null };
}

export interface AssignmentAnalytics {
  prompt_data: PromptAnalytics;
  timeline_data: TimelineDataItem[];
  plagiarised_segments: PlagiarisedSegment[];
}

export interface PromptAnalytics {
  total_prompt_count: number;
  nature_counts: PromptAnalyticsCountItem[];
  aspect_counts: PromptAnalyticsCountItem[];
  tool_counts: PromptAnalyticsCountItem[];
}

export interface PromptAnalyticsCountItem {
  key: string;
  stage_type: string;
  count: number | undefined;
  class_average: number;
}

export interface TimelineDataItem {
  stage_type: string;
  start_time: number | null;
  end_time: number | null;
}

export type PlagiarisedSegment = {
  offset: number;
  sequence: string;
  type: 'pasted' | 'repeated';
};

export type AssignmentOptions = {
  id: number;
  title: string;
}[];
