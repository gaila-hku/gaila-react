import { callAPIHandler } from 'api/_base';
import type { ReminderListingResponse, StudentReminder } from 'types/reminder';

type SendReminderPayload = {
  assignment_id: number;
  student_id: number;
  reminder_type: 'writing' | 'ai' | 'dashboard' | 'copying';
};

export const apiSendReminder = (
  payload: SendReminderPayload,
): Promise<StudentReminder> =>
  callAPIHandler('post', '/reminder/send', payload, true);

export const apiGetReminders = async ({
  queryKey,
}: {
  queryKey: [
    string,
    {
      page: number;
      limit: number;
    },
  ];
}) => {
  const [, query] = queryKey;
  const res = await callAPIHandler<ReminderListingResponse>(
    'get',
    '/reminder/listing',
    query,
    true,
  );
  return res;
};
apiGetReminders.queryKey = '/reminder/listing';
