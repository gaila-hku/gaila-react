import React, { useCallback, useEffect, useState } from 'react';

import Divider from 'components/display/Divider';
import CheckboxInput from 'components/input/CheckboxInput';
import SwitchInput from 'components/input/SwitchInput';

import type { AssignmentDetails } from 'types/assignment';

type DashboardConfigType = NonNullable<
  NonNullable<AssignmentDetails['config']>['dashboard']
>;

type Props = {
  formDataValue: DashboardConfigType | undefined;
  onFormDataChange: (field: string, value: any) => void;
};

const DASHBOARD_CONFIG_SECTIONS = [
  {
    key: 'performance',
    label: 'Performance metrics',
    fields: [
      { key: 'word_count', label: 'Word Count' },
      { key: 'goal_progress', label: 'Goal Progress' },
      { key: 'complexity_scores', label: 'Complexity Scores' },
      { key: 'accuracy_scores', label: 'Accuracy Scores' },
      { key: 'writing_insights', label: 'Advice for Improvement' },
    ] as {
      key: keyof DashboardConfigType;
      label: string;
    }[],
  },
  {
    key: 'ai_interaction',
    label: 'AI Interaction analysis',
    fields: [
      { key: 'agent_usage', label: 'Tool Usage' },
      { key: 'copying_detector', label: 'ChatGPT Copying Detector' },
      { key: 'prompt_category_nature', label: 'Prompt Category - Nature' },
      { key: 'prompt_category_aspect', label: 'Prompt Category - Aspect' },
    ] as {
      key: keyof NonNullable<AssignmentDetails['config']>['dashboard'];
      label: string;
    }[],
  },
];

const AssignmentEditorFormDashboardInput = ({
  formDataValue,
  onFormDataChange,
}: Props) => {
  const [enabledValue, setEnabledValue] = useState<DashboardConfigType>({
    enabled: false,
    word_count: false,
    goal_progress: false,
    complexity_scores: false,
    accuracy_scores: false,
    copying_detector: false,
    prompt_category_nature: false,
    prompt_category_aspect: false,
    agent_usage: false,
    writing_insights: false,
  });

  useEffect(() => {
    setEnabledValue({
      enabled: formDataValue?.enabled || false,
      word_count: formDataValue?.word_count || false,
      goal_progress: formDataValue?.goal_progress || false,
      complexity_scores: formDataValue?.complexity_scores || false,
      accuracy_scores: formDataValue?.accuracy_scores || false,
      copying_detector: formDataValue?.copying_detector || false,
      prompt_category_nature: formDataValue?.prompt_category_nature || false,
      prompt_category_aspect: formDataValue?.prompt_category_aspect || false,
      agent_usage: formDataValue?.agent_usage || false,
      writing_insights: formDataValue?.writing_insights || false,
    });
  }, [formDataValue]);

  const onToggleEnable = useCallback(
    (field: keyof typeof enabledValue, value: boolean) => {
      setEnabledValue(prev => ({ ...prev, [field]: value }));
      onFormDataChange(`config.dashboard.${field}`, value);
    },
    [onFormDataChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Dashboard Configurations</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Choose to enable dashboard features for students (Note: Teachers can
            always view all dashboard features)
          </p>
        </div>
        <SwitchInput
          onChange={value => onToggleEnable('enabled', value)}
          value={enabledValue.enabled}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {DASHBOARD_CONFIG_SECTIONS.map(({ key, label, fields }) => (
          <div className="p-4 border rounded-lg bg-muted/30" key={key}>
            <h4>{label}</h4>
            <Divider className="py-1 !mb-2" />
            {fields.map(field => (
              <CheckboxInput
                disabled={!enabledValue.enabled}
                key={field.key}
                labelSx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                onChange={value => onToggleEnable(field.key, value.length > 0)}
                options={[field]}
                value={enabledValue[field.key] ? [field.key] : []}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentEditorFormDashboardInput;
