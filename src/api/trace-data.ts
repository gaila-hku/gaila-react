import { callAPIHandler } from 'api/_base';
import { type ClassListingResponse } from 'types/class';

interface SaveTraceDataPayload {
  assignment_id: number | null;
  stage_id: number | null;
  action: string;
  content?: string;
}

export const apiSaveTraceData = async (payload: SaveTraceDataPayload) => {
  const res = await callAPIHandler<ClassListingResponse>(
    'post',
    '/trace-data/save',
    payload,
    true,
  );
  return res;
};
