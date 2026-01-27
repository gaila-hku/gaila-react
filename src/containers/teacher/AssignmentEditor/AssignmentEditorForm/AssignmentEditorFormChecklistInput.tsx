import React, { useCallback, useEffect, useState } from 'react';

import { CircleCheckBig, Plus, X } from 'lucide-react';

import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

type Props = {
  formDataValue: string[];
  onFormDataChange: (field: string, value: any) => void;
};

const AssignmentEditorFormChecklistInput = ({
  formDataValue,
  onFormDataChange,
}: Props) => {
  const [checklist, setChecklist] = useState<string[]>(['']);

  const handleAddChecklistItem = useCallback(() => {
    const newChecklist = [...checklist, ''];
    setChecklist(newChecklist);
    onFormDataChange('checklist', newChecklist);
  }, [onFormDataChange, checklist]);

  const handleRemoveChecklistItem = useCallback(
    (index: number) => {
      const newChecklist = checklist.filter((_, i) => i !== index);
      setChecklist(newChecklist);
      onFormDataChange('checklist', newChecklist);
    },
    [onFormDataChange, checklist],
  );

  const handleChecklistChange = useCallback(
    (index: number, value: string) => {
      const newChecklist = [...checklist];
      newChecklist[index] = value;
      setChecklist(newChecklist);
      onFormDataChange('checklist', newChecklist);
    },
    [onFormDataChange, checklist],
  );

  useEffect(() => {
    setChecklist(formDataValue);
  }, [formDataValue]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Writing checklist for students</h4>
        <Button
          className="gap-2"
          onClick={handleAddChecklistItem}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {checklist.map((tip, index) => (
          <div className="flex gap-2 items-start" key={index}>
            <div className="flex-1 space-y-2 flex gap-2 items-center">
              <CircleCheckBig className="mb-0" color="green" />
              <TextInput
                className="flex-1"
                onChange={e => handleChecklistChange(index, e.target.value)}
                placeholder="e.g. Use active voice in a speech / Start with a compelling hook / Refer to textbook P. 124"
                value={tip}
              />
            </div>
            <Button
              disabled={checklist.length === 1}
              onClick={() => handleRemoveChecklistItem(index)}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentEditorFormChecklistInput;
