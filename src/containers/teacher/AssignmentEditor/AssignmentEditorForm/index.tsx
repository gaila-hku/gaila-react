import React, { type RefObject, useCallback, useEffect, useState } from 'react';

import Divider from 'components/display/Divider';
import Label from 'components/display/Label';
import DateTimeInput from 'components/input/DateTimeInput';
import NumberInput from 'components/input/NumberInput';
import SelectInput from 'components/input/SelectInput';
import SwitchInput from 'components/input/SwitchInput';
import TextInput from 'components/input/TextInput';

import type { AssignmentFormData } from 'containers/teacher/AssignmentEditor';
import AssignmentEditorFormChecklistInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormChecklistInput';
import AssignmentEditorFormDashboardInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormDashboardInput';
import AssignmentEditorFormRubricsInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormRubricsInput';
import AssignmentEditorFormStageInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/AssignmentEditorFormStageInput';
import StudentEnrollInput from 'containers/teacher/AssignmentEditor/AssignmentEditorForm/StudentEnrollInput';

import type { ClassOption } from 'types/class';
import type { UserOption } from 'types/user';

type Props = {
  formData: RefObject<AssignmentFormData>;
  onFormDataChange: (field: string, value: any) => void;
  isEditing: boolean;
};

const AssignmentEditorForm = ({
  formData,
  onFormDataChange,
  isEditing,
}: Props) => {
  const [enrolledClasses, setEnrolledClasses] = useState<ClassOption[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<UserOption[]>([]);

  const handleEnrolledClassesChange = useCallback(
    (value: ClassOption[]) => {
      setEnrolledClasses(value);
      onFormDataChange('enrolled_classes', value);
    },
    [onFormDataChange],
  );

  const handleEnrolledStudentsChange = useCallback(
    (value: UserOption[]) => {
      setEnrolledStudents(value);
      onFormDataChange('enrolled_students', value);
    },
    [onFormDataChange],
  );

  useEffect(() => {
    setEnrolledClasses(formData.current.enrolled_classes || []);
    setEnrolledStudents(formData.current.enrolled_students || []);
  }, [formData]);

  return (
    <>
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" required>
            Assignment Title
          </Label>
          <TextInput
            defaultValue={formData.current.title}
            id="title"
            onChange={e => onFormDataChange('title', e.target.value)}
            placeholder="e.g. Unit 4 - Climate Change Impact Essay"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" required>
            Description
          </Label>
          <TextInput
            defaultValue={formData.current.description}
            id="description"
            multiline
            onChange={e => onFormDataChange('description', e.target.value)}
            placeholder="Brief description of the essay assignment"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="essayType" required>
              Essay Type
            </Label>
            <SelectInput
              className="w-full"
              defaultValue={formData.current.type}
              fullWidth
              onChange={value => onFormDataChange('type', value)}
              options={[
                { value: 'general', label: 'General' },
                { value: 'argumentative', label: 'Argumentative' },
                { value: 'narrative', label: 'Narrative' },
                { value: 'expository', label: 'Expository' },
                { value: 'descriptive', label: 'Descriptive' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" required>
              Due Date
            </Label>
            <DateTimeInput
              defaultValue={formData.current.due_date}
              onChange={value => onFormDataChange('due_date', value)}
              type="date"
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* Essay Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt">Instructions</Label>
        <TextInput
          defaultValue={formData.current.instructions}
          id="instructions"
          multiline
          onChange={e => onFormDataChange('instructions', e.target.value)}
          placeholder="Instructions for the assignment (e.g. tools, reference materials, etc.)"
          rows={6}
        />
      </div>

      <Divider />

      <AssignmentEditorFormChecklistInput
        formDataValue={formData.current.checklist || []}
        onFormDataChange={onFormDataChange}
      />

      <Divider />

      {/* Requirements */}
      <div className="space-y-4">
        <h4 className="font-medium">Requirements</h4>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minWords">Minimum Words</Label>
            <NumberInput
              defaultValue={
                formData.current.requirements?.min_word_count || undefined
              }
              id="minWords"
              onChange={value =>
                onFormDataChange('requirements.min_word_count', value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxWords">Maximum Words</Label>
            <NumberInput
              defaultValue={
                formData.current.requirements?.max_word_count || undefined
              }
              id="maxWords"
              onChange={value =>
                onFormDataChange('requirements.max_word_count', value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="titleRequired">Title Required</Label>
            <SwitchInput
              defaultChecked={formData.current.requirements?.title || false}
              id="titleRequired"
              onChange={value => onFormDataChange('requirements.title', value)}
            />
          </div>
        </div>
      </div>

      <Divider />

      <AssignmentEditorFormRubricsInput
        formDataValue={formData.current.rubrics || []}
        onFormDataChange={onFormDataChange}
      />

      <Divider />

      <AssignmentEditorFormStageInput
        formDataStageValue={formData.current.stages}
        isEditing={isEditing}
        onFormDataChange={onFormDataChange}
      />

      <Divider />

      <AssignmentEditorFormDashboardInput
        formDataValue={formData.current.config?.dashboard}
        onFormDataChange={onFormDataChange}
      />

      <Divider />

      <StudentEnrollInput
        enrolledClasses={enrolledClasses}
        enrolledStudents={enrolledStudents}
        setEnrolledClasses={handleEnrolledClassesChange}
        setEnrolledStudents={handleEnrolledStudentsChange}
      />
    </>
  );
};

export default AssignmentEditorForm;
