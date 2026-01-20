import React, { useCallback, useEffect, useState } from 'react';

import { Plus, X } from 'lucide-react';

import Divider from 'components/display/Divider';
import CheckboxInput from 'components/input/CheckboxInput';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import { LANGUAGE_STAGE_TOOLS } from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/utils';

import type {
  AssignmentStageEditType,
  AssignmentStageLanguagePreparation,
} from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  onStageChange: (stage: AssignmentStageEditType) => void;
};

const VOCAB_OPTION = [
  {
    key: 'vocab_enabled',
    label: 'Enable vocabulary/phrases generation',
    tooltip:
      'Students will be able to highlight and leave notes on the reading material',
  },
];

const AssignmentEditorFormLanguageStageInput = ({
  stage,
  onStageChange,
}: Props) => {
  const [readings, setReadings] = useState<string[]>([]);
  const [readingInput, setReadingInput] = useState('');
  const [vocabEnabled, setVocabEnabled] = useState(false);

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
    const configValue = (stage as AssignmentStageLanguagePreparation).config;
    setReadings(configValue.readings || []);
    setVocabEnabled(configValue.vocabulary_enabled || false);
  }, [stage]);

  const onAddReading = useCallback(() => {
    const newReadings = [...readings];
    newReadings.push(readingInput.trim());
    setReadings(newReadings);
    setReadingInput('');
    onStageChange({
      ...stage,
      config: { ...stage.config, readings: newReadings },
    });
  }, [onStageChange, readingInput, readings, stage]);

  const onRemoveReading = useCallback(
    (index: number) => {
      const newReadings = [...readings];
      newReadings.splice(index, 1);
      setReadings(newReadings);
      onStageChange({
        ...stage,
        config: { ...stage.config, readings: newReadings },
      });
    },
    [onStageChange, readings, stage],
  );

  const onToggleAnnotation = useCallback(
    (value: boolean) => {
      const newStage = { ...stage } as AssignmentStageLanguagePreparation;
      newStage.config.vocabulary_enabled = value;
      onStageChange(newStage);
      setVocabEnabled(value);
    },
    [onStageChange, stage],
  );

  return (
    <>
      {LANGUAGE_STAGE_TOOLS.map(tool => (
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
        options={VOCAB_OPTION}
        value={vocabEnabled ? VOCAB_OPTION.map(o => o.key) : []}
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

export default AssignmentEditorFormLanguageStageInput;
