import React, { useCallback } from 'react';

import CheckboxInput from 'components/input/CheckboxInput';

import { REVISING_STAGE_TOOLS } from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/utils';

import type {
  AssignmentStageEditType,
  AssignmentStageRevising,
} from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  onStageChange: (stage: AssignmentStageEditType) => void;
};

const AssignmentEditorFormRevisingStageInput = ({
  stage,
  onStageChange,
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

  const handleRevisionExplanationToggle = useCallback(
    (value: boolean) => {
      const newStage = { ...stage } as AssignmentStageRevising;
      newStage.config.revision_tool_ask_explanation = value;
      onStageChange(newStage);
    },
    [onStageChange, stage],
  );

  return (
    <>
      {REVISING_STAGE_TOOLS.map(tool => (
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
          {tool.key === 'revision' && (
            <div className="pl-5 mt-1">
              <CheckboxInput
                defaultValue={
                  (stage as AssignmentStageRevising).config
                    .revision_tool_ask_explanation
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
                  handleRevisionExplanationToggle(!!value.length)
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

export default AssignmentEditorFormRevisingStageInput;
