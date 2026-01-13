import React, { useCallback } from 'react';

import Divider from 'components/display/Divider';
import CheckboxInput from 'components/input/CheckboxInput';

import type { Assignment, AssignmentStageEditType } from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  onStageChange: (stage: AssignmentStageEditType) => void;
  formDataConfigValue: Assignment['config'];
  onFormDataChange: (field: string, value: any) => void;
};

const WRITING_STAGE_TOOLS = [
  {
    key: 'ideation_guiding',
    label: 'Ideation Agent',
    tooltip:
      'This tool will only be shown in outlining stage. If outlining stage is not separated, this tool will only be shown in draft stage',
  },
  {
    key: 'outline_review',
    label: 'Outline Review Agent',
    tooltip: 'This tool will only be shown in outlining stage.',
  },
  { key: 'dictionary', label: 'Dictionary Chatbot' },
  { key: 'autograde', label: 'AI Auto Grading' },
  {
    key: 'revision',
    label: 'AI Revision',
    tooltip:
      'This tool will only be shown in revision stage. If revision stage is not separated, this tool will only be shown in draft stage.',
  },
  { key: 'writing_general', label: 'General Chatbot' },
];

const AssignmentEditorFormWritingStageInput = ({
  stage,
  onStageChange,
  formDataConfigValue,
  onFormDataChange,
}: Props) => {
  const onStageToggleTools = useCallback(
    (toolKey: string, value: boolean) => {
      const newStage = { ...stage };
      const newTool = newStage.tools.find(t => t.key === toolKey);
      if (newTool) {
        newTool.enabled = value;
      } else {
        newStage.tools.push({ key: toolKey, enabled: value });
      }

      onStageChange(newStage);
    },
    [onStageChange, stage],
  );

  return (
    <>
      <div>
        <CheckboxInput
          defaultValue={
            formDataConfigValue?.outline_enabled ? ['outline_enabled'] : []
          }
          labelSx={{
            '& .MuiTypography-root': { fontSize: '0.875rem' },
          }}
          onChange={value =>
            onFormDataChange('config.outline_enabled', !!value.length)
          }
          options={[
            { key: 'outline_enabled', label: 'Separate Outlining stage' },
          ]}
        />
        <CheckboxInput
          defaultValue={
            formDataConfigValue?.revision_enabled ? ['revision_enabled'] : []
          }
          labelSx={{
            '& .MuiTypography-root': { fontSize: '0.875rem' },
          }}
          onChange={value =>
            onFormDataChange('config.revision_enabled', !!value.length)
          }
          options={[
            { key: 'revision_enabled', label: 'Separate Revising stage' },
          ]}
        />
        <Divider className="!mb-2" />
      </div>
      {WRITING_STAGE_TOOLS.map(tool => (
        <React.Fragment key={tool.key}>
          <CheckboxInput
            key={tool.key}
            labelSx={{
              '& .MuiTypography-root': { fontSize: '0.875rem' },
            }}
            onChange={value => onStageToggleTools(tool.key, !!value.length)}
            options={[tool]}
            value={
              stage.tools.find(t => t.key === tool.key)?.enabled
                ? [tool.key]
                : []
            }
          />
          {tool.key === 'revision' && stage.stage_type === 'writing' && (
            <div className="pl-5 mt-1">
              <CheckboxInput
                defaultValue={
                  formDataConfigValue?.revision_tool_ask_explanation
                    ? ['revision_tool_ask_explanation']
                    : []
                }
                disabled={
                  !stage.tools.find(t => t.key === 'revision' && t.enabled)
                }
                labelSx={{
                  '& .MuiTypography-root': { fontSize: '0.875rem' },
                }}
                onChange={value =>
                  onFormDataChange(
                    'config.revision_tool_ask_explanation',
                    !!value.length,
                  )
                }
                options={[
                  {
                    key: 'revision_tool_ask_explanation',
                    label:
                      'Prompt students to provide explanation for revisions',
                  },
                ]}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default AssignmentEditorFormWritingStageInput;
