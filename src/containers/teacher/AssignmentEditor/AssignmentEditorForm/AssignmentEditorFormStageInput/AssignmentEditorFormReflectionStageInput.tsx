import React, { useCallback, useEffect, useState } from 'react';

import { Plus, X } from 'lucide-react';

import Divider from 'components/display/Divider';
import CheckboxInput from 'components/input/CheckboxInput';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';
import { REFLECTION_STAGE_TOOLS } from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput/utils';

import type {
  AssignmentStageEditType,
  AssignmentStageReflection,
} from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  onStageChange: (stage: AssignmentStageEditType) => void;
};

const defaultReflectionQuestions = REFLECTION_QUESTIONS.map(s => s.question);

const AssignmentEditorFormReflectionStageInput = ({
  stage,
  onStageChange,
}: Props) => {
  const [reflectionQuestions, setReflectionQuestions] = useState(
    defaultReflectionQuestions,
  );
  const [reflectionQuestionInput, setReflectionQuestionInput] = useState('');

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
    setReflectionQuestions(
      (stage as AssignmentStageReflection).config.reflection_questions ||
        defaultReflectionQuestions,
    );
  }, [stage]);

  const onAddReflectionQuestion = useCallback(() => {
    const newReflectionQuestions = [...reflectionQuestions];
    newReflectionQuestions.push(reflectionQuestionInput.trim());
    setReflectionQuestions(newReflectionQuestions);
    onStageChange({
      ...stage,
      config: {
        ...stage.config,
        reflection_questions: newReflectionQuestions,
      },
    });
    setReflectionQuestionInput('');
  }, [onStageChange, reflectionQuestionInput, reflectionQuestions, stage]);

  const onRemoveReflectionQuestion = useCallback(
    (index: number) => {
      const newReflectionQuestions = [...reflectionQuestions];
      newReflectionQuestions.splice(index, 1);
      setReflectionQuestions(newReflectionQuestions);
      onStageChange({
        ...stage,
        config: {
          ...stage.config,
          reflection_questions: newReflectionQuestions,
        },
      });
    },
    [onStageChange, reflectionQuestions, stage],
  );

  return (
    <>
      {REFLECTION_STAGE_TOOLS.map(tool => (
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
      <Divider className="!my-1" />
      <div className="text-sm font-semibold py-2">Customize Questions</div>
      {reflectionQuestions.map((question, index) => (
        <div className="flex gap-2 items-start pb-2" key={index}>
          <p className="text-sm">{index + 1}. </p>
          <p className="text-sm w-full">{question}</p>
          <Clickable onClick={() => onRemoveReflectionQuestion(index)}>
            <X className="w-4 h-4" />
          </Clickable>
        </div>
      ))}
      <div className="flex gap-2">
        <TextInput
          onChange={e => setReflectionQuestionInput(e.target.value)}
          placeholder="Reflection Question"
          value={reflectionQuestionInput}
        />
        <Clickable
          className="basis-[32px] flex items-center justify-center !bg-primary rounded"
          onClick={onAddReflectionQuestion}
        >
          <Plus className="w-4 h-4 text-white" />
        </Clickable>
      </div>
    </>
  );
};

export default AssignmentEditorFormReflectionStageInput;
