import { callAPIHandler } from 'api/_base';
import type {
  Assignment,
  AssignmentAnalytics,
  AssignmentDetails,
  AssignmentGrade,
  AssignmentListingResponse,
  AssignmentProgress,
  AssignmentRecentSubmissionListingItem,
  AssignmentSubmission,
  AssignmentSubmissionDetails,
  AssignmentSubmissionListingItem,
  RubricItem,
} from 'types/assignment';
import type { ListingResponse } from 'types/response';

export const apiGetAssignments = async ({
  queryKey,
}: {
  queryKey: [
    string,
    {
      page: number;
      limit: number;
      filter: {
        search?: string;
        subject?: string;
        status?: string;
      };
      sort?: string;
      sort_order?: 'asc' | 'desc';
    },
  ];
}) => {
  const [, { page, limit, filter, sort, sort_order }] = queryKey;
  const res = await callAPIHandler<AssignmentListingResponse>(
    'get',
    '/api/assignment/listing',
    { page, limit, filter: JSON.stringify(filter), sort, sort_order },
    true,
  );
  return res;
};
apiGetAssignments.queryKey = '/api/assignment/listing';

export const apiViewAssignment = async ({
  queryKey,
}: {
  queryKey: [string, number];
}): Promise<AssignmentDetails> => {
  const [, assignmentId] = queryKey;
  const res = await callAPIHandler<AssignmentDetails>(
    'get',
    `/api/assignment/view`,
    { id: assignmentId },
    true,
  );
  return res;
};
apiViewAssignment.queryKey = '/api/assignment/view/id';

export interface AssignmentCreatePayload {
  title: string;
  description?: string;
  due_date?: number | null;
  type?: string;
  instructions?: string;
  requirements?: {
    min_word_count?: number | null;
    max_word_count?: number | null;
  };
  rubrics?: RubricItem[];
  tips?: string[];
  enrolled_class_ids?: number[];
  enrolled_student_ids?: number[];
  stages: {
    stage_type: string;
    enabled: boolean;
    tools: { key: string; enabled: boolean }[];
  }[];
}

export const apiCreateAssignment = (
  assignment: AssignmentCreatePayload,
): Promise<Assignment> =>
  callAPIHandler('post', '/api/assignment/create', { assignment }, true);

export const apiUpdateAssignment = (
  assignment: { id: number } & Partial<AssignmentCreatePayload>,
): Promise<Assignment> =>
  callAPIHandler('post', '/api/assignment/update', { assignment }, true);

export const apiViewAssignmentProgress = async ({
  queryKey,
}: {
  queryKey: [string, number];
}): Promise<AssignmentProgress> => {
  const [, assignmentId] = queryKey;
  const res = await callAPIHandler<AssignmentProgress>(
    'get',
    `/api/assignment/view-progress`,
    { id: assignmentId },
    true,
  );
  return res;
};
apiViewAssignmentProgress.queryKey = '/api/assignment/view-progress/id';

export type AssignmentSaveSubmissionPayload = {
  assignment_id: number;
  stage_id: number;
  content: string;
  is_final: boolean;
  is_manual: boolean;
};

export const apiSaveAssignmentSubmission = (
  submission: AssignmentSaveSubmissionPayload,
): Promise<AssignmentSubmission> =>
  callAPIHandler('post', '/api/submission/submit', { submission }, true);

export const apiGetSubmisssionListing = async ({
  queryKey,
}: {
  queryKey: [
    string,
    {
      assignment_id: number;
      page: number;
      limit: number;
      filter: string;
    },
  ];
}) => {
  const [, queryParams] = queryKey;
  const res = await callAPIHandler<
    ListingResponse<AssignmentSubmissionListingItem>
  >('get', `/api/submission/listing`, queryParams, true);
  return res;
};
apiGetSubmisssionListing.queryKey = '/api/submission/listing';

export const apiGetSubmisssionRecentListing = async ({
  queryKey,
}: {
  queryKey: [
    string,
    {
      page: number;
      limit: number;
      filter: string;
    },
  ];
}) => {
  const [, queryParams] = queryKey;
  const res = await callAPIHandler<
    ListingResponse<AssignmentRecentSubmissionListingItem>
  >('get', `/api/submission/listing-recent`, queryParams, true);
  return res;
};
apiGetSubmisssionRecentListing.queryKey = '/api/submission/listing-recent';

export const apiViewAssignmentSubmission = async ({
  queryKey,
}: {
  queryKey: [string, number, number];
}): Promise<AssignmentSubmissionDetails> => {
  const [, assignmentId, studentId] = queryKey;
  const res = await callAPIHandler<AssignmentSubmissionDetails>(
    'get',
    `/api/submission/view`,
    { assignment_id: assignmentId, student_id: studentId },
    true,
  );
  return res;
};
apiViewAssignmentSubmission.queryKey = '/api/submission/view';

type AssignmentSaveGradingPayload = {
  submission_id: number;
  overall_score: number;
  overall_feedback: string | undefined;
  rubrics_breakdown: Record<string, number | null>;
};
export const apiSaveAssignmentGrading = (
  payload: AssignmentSaveGradingPayload,
): Promise<AssignmentGrade> =>
  callAPIHandler(
    'post',
    '/api/submission/grade',
    {
      ...payload,
      rubrics_breakdown: JSON.stringify(payload.rubrics_breakdown),
    },
    true,
  );

export const apiGetAssignmentAnalytics = async ({
  queryKey,
}: {
  queryKey: [string, number];
}): Promise<AssignmentAnalytics> => {
  const [, assignmentId] = queryKey;
  const res = await callAPIHandler<AssignmentAnalytics>(
    'get',
    `/api/assignment/analytics-student`,
    { assignment_id: assignmentId },
    true,
  );
  return res;
};
apiGetAssignmentAnalytics.queryKey = '/api/assignment/analytics-student';
