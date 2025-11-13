import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Plus, X } from 'lucide-react';

import Button from 'components/input/Button';
import NumberInput from 'components/input/NumberInput';
import TextInput from 'components/input/TextInput';

import type { RubricItem } from 'types/assignment';

type Props = {
  formDataValue: RubricItem[];
  onFormDataChange: (field: string, value: any) => void;
};

const AssignmentEditorFormRubricsInput = ({
  formDataValue,
  onFormDataChange,
}: Props) => {
  const [rubrics, setRubrics] = useState<RubricItem[]>([]);
  const handleAddRubricItem = useCallback(() => {
    const newRubrics = [
      ...rubrics,
      { criteria: '', description: '', max_points: 0 },
    ];
    setRubrics(newRubrics);
    onFormDataChange('rubrics', newRubrics);
  }, [onFormDataChange, rubrics]);

  const handleRemoveRubricItem = useCallback(
    (index: number) => {
      const newRubrics = rubrics.filter((_, i) => i !== index);
      setRubrics(newRubrics);
      onFormDataChange('rubrics', newRubrics);
    },
    [onFormDataChange, rubrics],
  );

  const handleRubricChange = useCallback(
    (index: number, field: keyof RubricItem, value: string | number | null) => {
      const newRubrics = [...rubrics];
      let newValue = value;
      if (field === 'max_points' && newValue === null) {
        newValue = 1;
      }
      newRubrics[index] = { ...newRubrics[index], [field]: newValue };
      setRubrics(newRubrics);
      onFormDataChange('rubrics', newRubrics);
    },
    [onFormDataChange, rubrics],
  );

  const totalPoints = useMemo(() => {
    return rubrics.reduce((sum, item) => sum + (item.max_points || 0), 0);
  }, [rubrics]);

  useEffect(() => {
    setRubrics(formDataValue);
  }, [formDataValue]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Grading Rubric</h4>
        <Button
          className="gap-2"
          onClick={handleAddRubricItem}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add Criteria
        </Button>
      </div>

      <div className="space-y-4">
        {rubrics.map((item, index) => (
          <div className="flex gap-2 items-start" key={index}>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <TextInput
                    onChange={e =>
                      handleRubricChange(index, 'criteria', e.target.value)
                    }
                    placeholder="Criteria name"
                    value={item.criteria}
                  />
                </div>
                <NumberInput
                  inputClass="!w-24"
                  min={1}
                  onChange={value =>
                    handleRubricChange(index, 'max_points', value)
                  }
                  size="sm"
                  value={item.max_points}
                />
              </div>
              <TextInput
                minRows={2}
                multiline
                onChange={e =>
                  handleRubricChange(index, 'description', e.target.value)
                }
                placeholder="Detailed description of the criteria, what content is expected at each score"
                value={item.description}
              />
            </div>
            <Button
              disabled={rubrics.length === 1}
              onClick={() => handleRemoveRubricItem(index)}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <p className="text-sm text-muted-foreground">
          Total Points:{' '}
          <span className="font-medium text-foreground">{totalPoints}</span>
        </p>
      </div>
    </div>
  );
};

export default AssignmentEditorFormRubricsInput;
