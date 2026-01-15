import React, { useCallback, useEffect, useState } from 'react';

import { Plus, X } from 'lucide-react';

import Divider from 'components/display/Divider';
import CheckboxInput from 'components/input/CheckboxInput';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import { READING_STAGE_TOOLS } from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/utils';

import type {
  AssignmentStageEditType,
  AssignmentStageReading,
} from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  onStageChange: (stage: AssignmentStageEditType) => void;
};

const ANNOTATION_OPTION = [
  {
    key: 'annotation_enabled',
    label: 'Enable annotation',
    tooltip:
      'Students will be able to highlight and leave notes on the reading material',
  },
];

const AssignmentEditorFormReadingStageInput = ({
  stage,
  onStageChange,
}: Props) => {
  const [readings, setReadings] = useState<string[]>([]);
  const [readingInput, setReadingInput] = useState('');
  const [annotationEnabled, setAnnotationEnabled] = useState(false);

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

  useEffect(() => {
    const configValue = (stage as AssignmentStageReading).config;
    setReadings(configValue.readings || []);
    setAnnotationEnabled(configValue.annotation_enabled || false);
  }, [stage]);

  const onAddReading = useCallback(() => {
    const newReadings = [...readings];
    newReadings.push(readingInput.trim());
    setReadings(newReadings);
    setReadingInput('');
  }, [readingInput, readings]);

  const onRemoveReading = useCallback(
    (index: number) => {
      const newReadings = [...readings];
      newReadings.splice(index, 1);
      setReadings(newReadings);
    },
    [readings],
  );

  const onToggleAnnotation = useCallback(
    (value: boolean) => {
      const newStage = { ...stage } as AssignmentStageReading;
      newStage.config.annotation_enabled = value;
      onStageChange(newStage);
      setAnnotationEnabled(value);
    },
    [onStageChange, stage],
  );

  return (
    <>
      {READING_STAGE_TOOLS.map(tool => (
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
      <CheckboxInput
        labelSx={{
          '& .MuiTypography-root': { fontSize: '0.875rem' },
        }}
        onChange={value => onToggleAnnotation(!!value.length)}
        options={ANNOTATION_OPTION}
        value={annotationEnabled ? ANNOTATION_OPTION.map(o => o.key) : []}
      />
      <Divider className="!my-1" />
      <div className="text-sm font-semibold py-2">Reading Materials</div>
      {readings.map((reading, index) => (
        <div className="flex gap-2 items-start pb-2" key={index}>
          <p className="text-sm">{index + 1}. </p>
          <p className="text-sm whitespace-pre-wrap w-full">{reading}</p>
          <Clickable onClick={() => onRemoveReading(index)}>
            <X className="w-4 h-4" />
          </Clickable>
        </div>
      ))}
      <div className="flex gap-2 items-end">
        <TextInput
          multiline
          onChange={e => setReadingInput(e.target.value)}
          placeholder="Reading essay"
          value={readingInput}
        />
        <Clickable
          className="basis-[32px] h-[39px] flex items-center justify-center !bg-primary rounded"
          disabled={!readingInput}
          onClick={onAddReading}
        >
          <Plus className="w-4 h-4 text-white" />
        </Clickable>
      </div>
    </>
  );
};

export default AssignmentEditorFormReadingStageInput;
