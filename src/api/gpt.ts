import { callAPIHandler } from 'api/_base';
import type { GptLog } from 'types/gpt';
import type { ListingResponse } from 'types/response';

export interface AskGptRequestData {
  assignment_tool_id: number;
  question: string;
}

export const apiAskGpt = (payload: AskGptRequestData): Promise<GptLog> =>
  callAPIHandler('post', '/api/gpt/ask', payload, true);

export interface AskGptStructuredRequestData extends AskGptRequestData {
  is_structured: boolean;
}

export const apiAskDictionaryAgent = (
  payload: AskGptStructuredRequestData,
): Promise<GptLog> =>
  callAPIHandler('post', '/api/gpt/ask-dictionary', payload, true);

interface GetGptLogQueryParam {
  assignment_tool_id: number;
  page: number;
  limit: number;
}

export const apiGetGptChatLogs = async ({
  queryKey,
}: {
  queryKey: [string, GetGptLogQueryParam];
}) => {
  const [, queryParam] = queryKey;
  const res = await callAPIHandler<ListingResponse<GptLog>>(
    'get',
    '/api/gpt/listing-chat',
    queryParam,
    true,
  );
  return res;
};
apiGetGptChatLogs.queryKey = '/api/gpt/listing-chat';

export const apiGetLatestSturcturedGptLog = async ({
  queryKey,
}: {
  queryKey: [string, { assignment_tool_ids: number[] }];
}) => {
  const [, { assignment_tool_ids }] = queryKey;
  const res = await callAPIHandler<GptLog[]>(
    'get',
    '/api/gpt/latest-structured',
    { assignment_tool_ids: JSON.stringify(assignment_tool_ids) },
    true,
  );
  return res;
};
apiGetLatestSturcturedGptLog.queryKey = '/api/gpt/latest-structured';
