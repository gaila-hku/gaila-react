import { callAPIHandler } from 'api/_base';
import type { ChatbotConfig, ChatbotTemplate } from 'types/chatbot';

export const apiGetChatbotTemplates = async () => {
  const res = await callAPIHandler<ChatbotTemplate[]>(
    'get',
    '/chatbot-setting/listing',
    {},
    true,
  );
  return res;
};
apiGetChatbotTemplates.queryKey = '/chatbot-setting/listing';

export interface UpdateChatbotTemplatePayload {
  template_id: number;
  role_prompt: string;
  config: ChatbotConfig;
}
export const apiUpdateChatbotTemplate = async ({
  template_id,
  role_prompt,
  config,
}: UpdateChatbotTemplatePayload) => {
  const res = await callAPIHandler<ChatbotTemplate>(
    'post',
    '/chatbot-setting/update-general',
    {
      template_id,
      role_prompt,
      config: JSON.stringify(config),
    },
    true,
  );
  return res;
};

export interface UpdateAssignmentToolSettingPayload {
  assignment_tool_id: number;
  role_prompt: string | undefined;
  config: Partial<ChatbotConfig> | undefined;
}
export const apiUpdateAssignmentToolSetting = async ({
  assignment_tool_id,
  role_prompt,
  config,
}: UpdateAssignmentToolSettingPayload) => {
  const res = await callAPIHandler<ChatbotTemplate>(
    'post',
    '/chatbot-setting/update',
    {
      assignment_tool_id,
      role_prompt,
      config: JSON.stringify(config),
    },
    true,
  );
  return res;
};
