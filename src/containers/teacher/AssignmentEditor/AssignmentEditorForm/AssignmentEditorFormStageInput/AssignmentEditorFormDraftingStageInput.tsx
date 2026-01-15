import React, { useCallback } from 'react';

import CheckboxInput from 'components/input/CheckboxInput';

import { DRAFTING_STAGE_TOOLS } from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/utils';

import type { AssignmentStageEditType } from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  onStageChange: (stage: AssignmentStageEditType) => void;
};

const AssignmentEditorFormDraftingStageInput = ({
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

  return (
    <>
      {DRAFTING_STAGE_TOOLS.map(tool => (
        <CheckboxInput
          key={tool.key}
          labelSx={{
            '& .MuiTypography-root': { fontSize: '0.875rem' },
          }}
          onChange={value => onStageToggleTools(tool.key, !!value.length)}
          options={[tool]}
          value={
            stage.tools.find(t => t.key === tool.key)?.enabled ? [tool.key] : []
          }
        />
      ))}
    </>
  );
};

export default AssignmentEditorFormDraftingStageInput;
