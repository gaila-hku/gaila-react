import React, { useCallback, useEffect, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { isNumber } from 'lodash-es';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Label from 'components/display/Label';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import NumberInput from 'components/input/NumberInput';
import TextInput from 'components/input/TextInput';

import useAlert from 'containers/common/AlertProvider/useAlert';

import { apiGetAssignmentTools } from 'api/assignment';
import { apiUpdateAssignmentToolSetting } from 'api/chatbotSetting';
import type { AssignmentTool } from 'types/assignment';

const defaultToolValue = {
  tool_key: '',
};

type Props = {
  assignmentTool: AssignmentTool | null;
  setAssignmentTool: React.Dispatch<
    React.SetStateAction<AssignmentTool | null>
  >;
};

const AssignmentToolEditModal = ({
  assignmentTool,
  setAssignmentTool,
}: Props) => {
  const { alertMsg, errorMsg } = useAlert();
  const queryClient = useQueryClient();

  const { mutate: updateAssignmentTool, isLoading: isUpdateLoading } =
    useMutation(apiUpdateAssignmentToolSetting, {
      onSuccess: () => {
        queryClient.invalidateQueries([apiGetAssignmentTools.queryKey]);
        setAssignmentTool(null);
        alertMsg('Chatbot updated');
      },
      onError: e => {
        errorMsg(e);
      },
    });

  const [toolValue, setToolValue] =
    useState<
      Pick<AssignmentTool, 'tool_key' | 'custom_role_prompt' | 'custom_config'>
    >(defaultToolValue);

  // Init classValue
  useEffect(() => {
    if (assignmentTool) {
      setToolValue({
        tool_key: assignmentTool.tool_key,
        custom_role_prompt: assignmentTool.custom_role_prompt,
        custom_config: assignmentTool.custom_config,
      });
    }
  }, [assignmentTool]);

  const handleClose = useCallback(() => {
    setToolValue(defaultToolValue);
    setAssignmentTool(null);
  }, [setAssignmentTool]);

  const handleSubmit = useCallback(() => {
    if (!assignmentTool) {
      return;
    }
    updateAssignmentTool({
      assignment_tool_id: assignmentTool.id,
      role_prompt: toolValue.custom_role_prompt,
      config: toolValue.custom_config,
    });
  }, [assignmentTool, updateAssignmentTool, toolValue]);

  return (
    <Modal onClose={handleClose} open={!!assignmentTool}>
      <div
        className={clsx(
          'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
          'bg-white p-4 rounded-lg flex flex-col gap-4',
        )}
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="text-lg leading-none font-semibold">
              Edit Assignment Tool
            </div>
            <div className="text-muted-foreground text-sm">
              Update custom role prompt and configuration for this assignment
              tool.
            </div>
          </div>
          <Clickable onClick={handleClose}>
            <X />
          </Clickable>
        </div>
        <div className="space-y-4 pb-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="class_key">Tool Key</Label>
            <div>{toolValue.tool_key}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_prompt">Role Prompt</Label>
            <TextInput
              id="role_prompt"
              multiline
              onChange={e =>
                setToolValue({
                  ...toolValue,
                  custom_role_prompt: e.target.value,
                })
              }
              placeholder="Role Prompt"
              value={toolValue.custom_role_prompt}
            />
          </div>
          <div className="grid grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <NumberInput
                id="max_tokens"
                onChange={value =>
                  setToolValue({
                    ...toolValue,
                    custom_config: {
                      ...toolValue.custom_config,
                      max_tokens: isNumber(value) ? value : undefined,
                    },
                  })
                }
                placeholder="Max Tokens"
                value={toolValue.custom_config?.max_tokens}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <NumberInput
                id="temperature"
                onChange={value =>
                  setToolValue({
                    ...toolValue,
                    custom_config: {
                      ...toolValue.custom_config,
                      max_tokens: isNumber(value) ? value : undefined,
                    },
                  })
                }
                placeholder="Temperature"
                value={toolValue.custom_config?.temperature}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="choices">Choices</Label>
              <NumberInput
                id="choices"
                onChange={value =>
                  setToolValue({
                    ...toolValue,
                    custom_config: {
                      ...toolValue.custom_config,
                      max_tokens: isNumber(value) ? value : undefined,
                    },
                  })
                }
                placeholder="Choices"
                value={toolValue.custom_config?.choices}
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

export default AssignmentToolEditModal;
