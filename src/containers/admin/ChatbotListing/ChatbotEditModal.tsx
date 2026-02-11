import React, { useCallback, useEffect, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Label from 'components/display/Label';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import NumberInput from 'components/input/NumberInput';
import TextInput from 'components/input/TextInput';

import useAlert from 'containers/common/AlertProvider/useAlert';

import {
  apiGetChatbotTemplates,
  apiUpdateChatbotTemplate,
} from 'api/chatbotSetting';
import type { ChatbotTemplate } from 'types/chatbot';

const defaultChatbotValue = {
  name: '',
  description: '',
  default_role_prompt: '',
  default_config: {
    max_tokens: 0,
    temperature: 0,
    choices: 0,
  },
  default_model: '',
};

type Props = {
  chatbotTemplate: ChatbotTemplate | null;
  setChatbotTemplate: React.Dispatch<
    React.SetStateAction<ChatbotTemplate | null>
  >;
};

const ChatbotSettingEditModal = ({
  chatbotTemplate,
  setChatbotTemplate,
}: Props) => {
  const { alertMsg, errorMsg } = useAlert();
  const queryClient = useQueryClient();

  const { mutate: updateChatbot, isLoading: isUpdateLoading } = useMutation(
    apiUpdateChatbotTemplate,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([apiGetChatbotTemplates.queryKey]);
        setChatbotTemplate(null);
        alertMsg('Chatbot updated');
      },
      onError: e => {
        errorMsg(e);
      },
    },
  );

  const [chatbotValue, setChatbotValue] =
    useState<Omit<ChatbotTemplate, 'id' | 'created_at'>>(defaultChatbotValue);

  // Init classValue
  useEffect(() => {
    if (chatbotTemplate) {
      setChatbotValue({
        name: chatbotTemplate.name ?? '',
        description: chatbotTemplate.description ?? '',
        default_role_prompt: chatbotTemplate.default_role_prompt ?? '',
        default_config: {
          max_tokens: chatbotTemplate.default_config.max_tokens ?? 0,
          temperature: chatbotTemplate.default_config.temperature ?? 0,
          choices: chatbotTemplate.default_config.choices ?? 0,
        },
        default_model: chatbotTemplate.default_model ?? '',
      });
    }
  }, [chatbotTemplate]);

  const handleClose = useCallback(() => {
    setChatbotValue(defaultChatbotValue);
    setChatbotTemplate(null);
  }, [setChatbotTemplate]);

  const handleSubmit = useCallback(() => {
    if (!chatbotTemplate) {
      return;
    }
    updateChatbot({
      template_id: chatbotTemplate.id,
      role_prompt: chatbotValue.default_role_prompt,
      config: chatbotValue.default_config,
    });
  }, [chatbotTemplate, updateChatbot, chatbotValue]);

  return (
    <Modal onClose={handleClose} open={!!chatbotTemplate}>
      <div
        className={clsx(
          'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
          'bg-white p-4 rounded-lg flex flex-col gap-4',
        )}
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="text-lg leading-none font-semibold">
              Edit Chatbot Template
            </div>
            <div className="text-muted-foreground text-sm">
              Update default role prompt and configuration. Note that these
              configurations will be overridden by assignment-specific
              configurations
            </div>
          </div>
          <Clickable onClick={handleClose}>
            <X />
          </Clickable>
        </div>
        <div className="space-y-4 pb-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="class_key">Template Key</Label>
            <div>{chatbotValue.name}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <TextInput
              id="description"
              onChange={e =>
                setChatbotValue({
                  ...chatbotValue,
                  description: e.target.value,
                })
              }
              placeholder="Description"
              value={chatbotValue.description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_prompt">Role Prompt</Label>
            <TextInput
              id="role_prompt"
              multiline
              onChange={e =>
                setChatbotValue({
                  ...chatbotValue,
                  default_role_prompt: e.target.value,
                })
              }
              placeholder="Role Prompt"
              value={chatbotValue.default_role_prompt}
            />
          </div>
          <div className="grid grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <NumberInput
                id="max_tokens"
                onChange={value =>
                  setChatbotValue({
                    ...chatbotValue,
                    default_config: {
                      ...chatbotValue.default_config,
                      max_tokens: value || 0,
                    },
                  })
                }
                placeholder="Max Tokens"
                value={chatbotValue.default_config.max_tokens}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <NumberInput
                id="temperature"
                onChange={value =>
                  setChatbotValue({
                    ...chatbotValue,
                    default_config: {
                      ...chatbotValue.default_config,
                      temperature: value || 0,
                    },
                  })
                }
                placeholder="Temperature"
                value={chatbotValue.default_config.temperature}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="choices">Choices</Label>
              <NumberInput
                id="choices"
                onChange={value =>
                  setChatbotValue({
                    ...chatbotValue,
                    default_config: {
                      ...chatbotValue.default_config,
                      choices: value || 0,
                    },
                  })
                }
                placeholder="Choices"
                value={chatbotValue.default_config.choices}
              />
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          loading={isUpdateLoading}
          onClick={handleSubmit}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default ChatbotSettingEditModal;
