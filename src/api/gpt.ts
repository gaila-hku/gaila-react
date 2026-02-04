import { callAPIHandler } from 'api/_base';
import type {
  GptLog,
  PromptHistoryItem,
  StudentRevisionExplanation,
  StudentRevisionExplanationListingItem,
} from 'types/gpt';
import type { ListingResponse } from 'types/response';
import type { PartialBy } from 'utils/types/partialBy';

export interface AskGptRequestData {
  assignment_tool_id: number;
  question: string;
  reading?: string;
  essay?: string;
  outline?: string;
  extra?: string;
}

export const apiAskGpt = (payload: AskGptRequestData): Promise<GptLog> =>
  callAPIHandler('post', '/gpt/ask', payload, true);

export interface AskGptStructuredRequestData extends AskGptRequestData {
  is_structured: boolean;
}

export const apiAskIdeationGuidingAgent = (
  payload: PartialBy<AskGptStructuredRequestData, 'question'>,
): Promise<GptLog> =>
  callAPIHandler('post', '/gpt/ask-ideation-guiding', payload, true);

export const apiAskOutlineReviewAgent = (
  payload: PartialBy<AskGptStructuredRequestData, 'question'>,
): Promise<GptLog> =>
  callAPIHandler('post', '/gpt/ask-outline-review', payload, true);

export const apiAskDictionaryAgent = (
  payload: AskGptStructuredRequestData,
): Promise<GptLog> =>
  callAPIHandler('post', '/gpt/ask-dictionary', payload, true);

export const apiAskRevisionAgent = (
  payload: PartialBy<AskGptStructuredRequestData, 'question'>,
): Promise<GptLog> =>
  callAPIHandler('post', '/gpt/ask-revision', payload, true);

export const apiAskAutogradeAgent = (
  payload: PartialBy<AskGptStructuredRequestData, 'question'>,
): Promise<GptLog> =>
  callAPIHandler('post', '/gpt/ask-autograde', payload, true);

interface GetGptLogQueryParam {
  assignment_tool_id: number;
  page: number;
  limit: number;
  include_structured?: boolean;
}

export const apiGetGptChatLogs = async ({
  queryKey,
}: {
  queryKey: [string, GetGptLogQueryParam];
}) => {
  const [, queryParam] = queryKey;
  const res = await callAPIHandler<ListingResponse<GptLog>>(
    'get',
    '/gpt/listing-chat',
    queryParam,
    true,
  );
  return res;
};
apiGetGptChatLogs.queryKey = '/gpt/listing-chat';

export const apiGetLatestSturcturedGptLog = async ({
  queryKey,
}: {
  queryKey: [string, { assignment_tool_ids: number[] }];
}) => {
  const [, { assignment_tool_ids }] = queryKey;
  const res = await callAPIHandler<GptLog[]>(
    'get',
    '/gpt/latest-structured',
    { assignment_tool_ids: JSON.stringify(assignment_tool_ids) },
    true,
  );
  return res;
};
apiGetLatestSturcturedGptLog.queryKey = '/gpt/latest-structured';

interface GetAllGptPromptsQueryParam {
  user_id?: number;
  assignment_id: number;
  page: number;
  limit: number;
}
export const apiGetAllGptPrompts = async ({
  queryKey,
}: {
  queryKey: [string, GetAllGptPromptsQueryParam];
}) => {
  const [, queryParam] = queryKey;
  const res = await callAPIHandler<ListingResponse<PromptHistoryItem>>(
    'get',
    '/gpt/listing-all-prompt',
    queryParam,
    true,
  );
  return res;
};
apiGetAllGptPrompts.queryKey = '/gpt/listing-all-prompt';

export const apiGetRevisionExplanations = async ({
  queryKey,
}: {
  queryKey: [string, { gpt_log_ids: number[]; aspect_ids: string[] }];
}) => {
  const [, { gpt_log_ids, aspect_ids }] = queryKey;
  const res = await callAPIHandler<StudentRevisionExplanation[]>(
    'get',
    '/gpt/revision-explanations',
    {
      gpt_log_ids: JSON.stringify(gpt_log_ids),
      aspect_ids: JSON.stringify(aspect_ids),
    },
    true,
  );
  return res;
};
apiGetRevisionExplanations.queryKey = '/gpt/revision-explanations';

export const apiSubmitRevisionExplanation = (payload: {
  gpt_log_id: number;
  aspect_id: string;
  response_type: 'agree' | 'disagree' | 'partial';
  explanation?: string;
}): Promise<void> =>
  callAPIHandler('post', '/gpt/submit-revision-explanation', payload, true);

export const apiGetRevisionExplanationListing = async ({
  queryKey,
}: {
  queryKey: [
    string,
    { student_id: number; assignment_id: number; page: number; limit: number },
  ];
}) => {
  const [, queryParam] = queryKey;
  const res = await callAPIHandler<
    ListingResponse<StudentRevisionExplanationListingItem>
  >('get', '/gpt/revision-explanation-listing', queryParam, true);
  return res;
};
apiGetRevisionExplanationListing.queryKey = '/gpt/revision-explanation-listing';

export const apiGenerateVocab = (payload: {
  assignment_tool_id: number;
}): Promise<GptLog> =>
  callAPIHandler('post', '/gpt/generate-vocab', payload, true);

export interface GenerateDashboardResponse {
  usage_data: {
    annotations: { text: string; color: string; note: string }[];
    generatedVocabs: string[];
    checklist: string[];
  };
  gpt_log: GptLog;
}

export const apiGenerateDashboard = (payload: {
  assignment_tool_id: number;
}): Promise<GenerateDashboardResponse> =>
  callAPIHandler('post', '/gpt/generate-dashboard', payload, true);
