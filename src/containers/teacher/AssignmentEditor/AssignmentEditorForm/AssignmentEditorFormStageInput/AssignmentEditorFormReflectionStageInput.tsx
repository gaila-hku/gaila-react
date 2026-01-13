import React, { useCallback, useEffect, useState } from 'react';

import { Plus, X } from 'lucide-react';

import Divider from 'components/display/Divider';
import CheckboxInput from 'components/input/CheckboxInput';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';

import type { Assignment, AssignmentStageEditType } from 'types/assignment';

type Props = {
  stage: AssignmentStageEditType;
  onStageChange: (stage: AssignmentStageEditType) => void;
  formDataConfigValue: Assignment['config'];
  onFormDataChange: (field: string, value: any) => void;
};

const REFLECTION_STAGE_TOOLS = [
  { key: 'reflection_general', label: 'General Chatbot' },
];

const defaultReflectionQuestions = REFLECTION_QUESTIONS.map(s => s.question);

const AssignmentEditorFormReflectionStageInput = ({
  stage,
  onStageChange,
  formDataConfigValue,
  onFormDataChange,
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
      formDataConfigValue?.reflection_questions || defaultReflectionQuestions,
    );
  }, [formDataConfigValue?.reflection_questions]);

  const onAddReflectionQuestion = useCallback(() => {
    const newReflectionQuestions = [...reflectionQuestions];
    newReflectionQuestions.push(reflectionQuestionInput.trim());
    setReflectionQuestions(newReflectionQuestions);
    onFormDataChange('config.reflection_questions', newReflectionQuestions);
    setReflectionQuestionInput('');
  }, [onFormDataChange, reflectionQuestionInput, reflectionQuestions]);

  const onRemoveReflectionQuestion = useCallback(
    (index: number) => {
      const newReflectionQuestions = [...reflectionQuestions];
      newReflectionQuestions.splice(index, 1);
      setReflectionQuestions(newReflectionQuestions);
      onFormDataChange('config.reflection_questions', newReflectionQuestions);
    },
    [onFormDataChange, reflectionQuestions],
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
          <p className="text-sm">{question}</p>
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
