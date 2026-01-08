import React, { useCallback, useEffect, useState } from 'react';

import { isEmpty } from 'lodash-es';
import { Plus, X } from 'lucide-react';

import Divider from 'components/display/Divider';
import CheckboxInput from 'components/input/CheckboxInput';
import Clickable from 'components/input/Clickable';
import SwitchInput from 'components/input/SwitchInput';
import TextInput from 'components/input/TextInput';

import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';

import type { AssignmentCreatePayload } from 'api/assignment';
import type { Assignment } from 'types/assignment';

type AssignmentStageEditType = AssignmentCreatePayload['stages'][number];

type Props = {
  formDataStageValue: AssignmentStageEditType[];
  formDataConfigValue: Assignment['config'];
  onFormDataChange: (field: string, value: any) => void;
  isEditing: boolean;
};

const availableStages = [
  {
    stage_type: 'goal_setting',
    label: 'Goal Setting',
    tools: [{ key: 'goal_general', label: 'General Chatbot' }],
  },
  {
    stage_type: 'writing',
    label: 'Writing',
    tools: [
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
    ],
  },
  {
    stage_type: 'reflection',
    label: 'Reflection',
    tools: [{ key: 'reflection_general', label: 'General Chatbot' }],
  },
];

const defaultStages: AssignmentStageEditType[] = [
  {
    stage_type: 'goal_setting',
    enabled: true,
    tools: [{ key: 'goal_general', enabled: true }],
  },
  {
    stage_type: 'writing',
    enabled: true,
    tools: [
      { key: 'ideation_guiding', enabled: true },
      { key: 'outline_review', enabled: true },
      { key: 'dictionary', enabled: true },
      { key: 'autograde', enabled: true },
      { key: 'revision', enabled: true },
      { key: 'writing_general', enabled: true },
    ],
  },
  {
    stage_type: 'reflection',
    enabled: true,
    tools: [{ key: 'reflection_general', enabled: true }],
  },
];

const defaultReflectionQuestions = REFLECTION_QUESTIONS.map(s => s.question);

const AssignmentEditorFormStageInput = ({
  formDataStageValue,
  formDataConfigValue,
  onFormDataChange,
  isEditing,
}: Props) => {
  const [stages, setStages] =
    useState<AssignmentStageEditType[]>(defaultStages);
  const [reflectionQuestions, setReflectionQuestions] = useState(
    defaultReflectionQuestions,
  );
  const [reflectionQuestionInput, setReflectionQuestionInput] = useState('');

  useEffect(() => {
    if (isEmpty(formDataStageValue)) {
      setStages(defaultStages);
      if (!isEditing) {
        onFormDataChange('stages', defaultStages);
      }
    } else {
      setStages(formDataStageValue);
    }
    setReflectionQuestions(
      formDataConfigValue?.reflection_questions || defaultReflectionQuestions,
    );
  }, [
    formDataConfigValue?.reflection_questions,
    formDataStageValue,
    isEditing,
    onFormDataChange,
  ]);

  const onStageToggleEnable = useCallback(
    (index: number, value: boolean) => {
      const newStages = [...stages];
      newStages[index].enabled = value;
      setStages(newStages);
      onFormDataChange('stages', newStages);
    },
    [onFormDataChange, stages],
  );

  const onStageToggleTools = useCallback(
    (stageIndex: number, toolKey: string, value: boolean) => {
      const newStages = [...stages];
      const newTool = newStages[stageIndex].tools.find(t => t.key === toolKey);
      if (newTool) {
        newTool.enabled = value;
      } else {
        newStages[stageIndex].tools.push({ key: toolKey, enabled: value });
      }
      setStages(newStages);
      onFormDataChange('stages', newStages);
    },
    [onFormDataChange, stages],
  );

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
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">Stages and Tools</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Choose to include writing stages and enable tools for students
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {availableStages.map((stage, stageIndex) => (
          <div
            className="p-4 border rounded-lg bg-muted/30"
            key={stage.stage_type}
          >
            <div className="flex justify-between items-center">
              <h4>{stage.label}</h4>
              {stage.stage_type !== 'writing' && (
                <SwitchInput
                  onChange={value => onStageToggleEnable(stageIndex, value)}
                  value={stages[stageIndex].enabled}
                />
              )}
            </div>
            <Divider className="py-1 !mb-2" />
            {stage.stage_type === 'writing' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm">Separate Outlining stage</div>
                  <SwitchInput
                    defaultChecked={formDataConfigValue?.outline_enabled}
                    onChange={value =>
                      onFormDataChange('config.outline_enabled', value)
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Separate Revising stage</div>
                  <SwitchInput
                    defaultChecked={formDataConfigValue?.revision_enabled}
                    onChange={value =>
                      onFormDataChange('config.revision_enabled', value)
                    }
                  />
                </div>
                <Divider className="!mb-2" />
              </div>
            )}
            {stage.tools.map(tool => (
              <React.Fragment key={tool.key}>
                <CheckboxInput
                  disabled={!stages[stageIndex].enabled}
                  labelSx={{
                    '& .MuiTypography-root': { fontSize: '0.875rem' },
                  }}
                  onChange={value =>
                    onStageToggleTools(stageIndex, tool.key, !!value.length)
                  }
                  options={[tool]}
                  value={
                    stages[stageIndex].tools.find(t => t.key === tool.key)
                      ?.enabled
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
                        !stages[stageIndex].enabled ||
                        !stages[stageIndex].tools.find(
                          t => t.key === 'revision' && t.enabled,
                        )
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
            {stage.stage_type === 'reflection' && (
              <>
                <Divider />
                <div className="text-sm">Customize Questions</div>
                {reflectionQuestions.map((question, index) => (
                  <div className="flex gap-2 items-start pb-2" key={index}>
                    <p className="text-sm">{index + 1}. </p>
                    <p className="text-sm">{question}</p>
                    <Clickable
                      onClick={() => onRemoveReflectionQuestion(index)}
                    >
                      <X className="w-4 h-4" />
                    </Clickable>
                  </div>
                ))}
                <div className="flex gap-2">
                  <TextInput
                    className="flex-1"
                    label="Reflection Question"
                    onChange={e => setReflectionQuestionInput(e.target.value)}
                    size="small"
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentEditorFormStageInput;
