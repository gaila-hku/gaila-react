import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isNumber, set } from 'lodash-es';
import { Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';

import AIChatBox from 'containers/common/AIChatBox';
import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import useAlert from 'containers/common/AlertProvider/useAlert';
import AssignmentEditorForm from 'containers/teacher/AssignmentEditor/AssignmentEditorForm';

import {
  type AssignmentCreatePayload,
  apiCreateAssignment,
  apiGetAssignments,
  apiUpdateAssignment,
  apiViewAssignment,
} from 'api/assignment';
import type { AssignmentDetails } from 'types/assignment';
import tuple from 'utils/types/tuple';

interface AssignmentCreatorProps {
  assignmentId?: number;
  onBack: () => void;
}

export type AssignmentFormData = Omit<AssignmentDetails, 'id' | 'status'>;
const defaultData: AssignmentFormData = {
  title: '',
  description: '',
  due_date: null,
  type: 'general',
  instructions: '',
  requirements: {
    min_word_count: null,
    max_word_count: null,
  },
  rubrics: [
    { criteria: 'Content', description: '', max_points: 7 },
    { criteria: 'Grammar', description: '', max_points: 7 },
    { criteria: 'Organization', description: '', max_points: 7 },
  ],
  tips: [''],
  checklist: [''],
  config: {
    dashboard: {
      enabled: true,
      word_count: true,
      goal_progress: true,
      complexity_scores: true,
      accuracy_scores: true,
      copying_detector: true,
      prompt_category_nature: true,
      prompt_category_aspect: true,
      agent_usage: true,
      writing_insights: true,
    },
  },
  enrolled_classes: [],
  enrolled_students: [],
  stages: [],
};

function AssignmentEditor({ assignmentId, onBack }: AssignmentCreatorProps) {
  const navigate = useNavigate();
  const { successMsg, errorMsg } = useAlert();
  const queryClient = useQueryClient();

  const {
    data: assignmentData,
    isLoading,
    error,
  } = useQuery(
    tuple([apiViewAssignment.queryKey, assignmentId as number]),
    apiViewAssignment,
    {
      enabled: !!assignmentId,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: createAssignment, isLoading: createAssignmentLoading } =
    useMutation(apiCreateAssignment, {
      onSuccess: async res => {
        successMsg('Assignment created successfully');
        await queryClient.invalidateQueries([apiGetAssignments.queryKey]);
        navigate(pathnames.assignmentEditDetails(String(res.id)));
      },
      onError: error => {
        errorMsg(error);
      },
    });

  const { mutate: updateAssignment, isLoading: updateAssignmentLoading } =
    useMutation(apiUpdateAssignment, {
      onSuccess: async () => {
        successMsg('Assignment saved successfully');
        setEdited(false);
        await queryClient.invalidateQueries([
          apiViewAssignment.queryKey,
          assignmentId as number,
        ]);
      },
      onError: error => {
        errorMsg(error);
      },
    });

  const isEditing = !!assignmentId;

  const formData = useRef<AssignmentFormData>(defaultData);
  const [edited, setEdited] = useState(false);
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    if (assignmentData) {
      formData.current = {
        ...assignmentData,
        tips: assignmentData.tips || defaultData.tips,
        checklist: assignmentData.checklist || defaultData.checklist,
        rubrics: assignmentData.rubrics || defaultData.rubrics,
        requirements: assignmentData.requirements || defaultData.requirements,
      };
    } else {
      formData.current = { ...defaultData };
    }
    setEdited(false);
    setUpdate(Date.now());
  }, [assignmentData]);

  const onFormDataChange = useCallback((field: string, value: any) => {
    const newData = set(formData.current, field, value);
    formData.current = newData;
    setEdited(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!isNumber(update)) {
      return;
    }

    const assignmentPayload: AssignmentCreatePayload = {
      ...{
        ...formData.current,
        enrolled_classes: undefined,
        enrolled_students: undefined,
      },
      tips: formData.current.tips?.filter(s => !!s),
      checklist: formData.current.checklist?.filter(s => !!s),
      enrolled_class_ids: formData.current.enrolled_classes.map(c => c.id),
      enrolled_student_ids: formData.current.enrolled_students.map(c => c.id),
    };

    if (isEditing) {
      if (!assignmentId) {
        errorMsg('Something went wrong');
        return;
      }
      updateAssignment({
        id: assignmentId,
        ...assignmentPayload,
      });
      return;
    }
    createAssignment(assignmentPayload);
  }, [
    assignmentId,
    createAssignment,
    errorMsg,
    isEditing,
    update,
    updateAssignment,
  ]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <div className="grid grid-cols-7 gap-4">
      <Card
        classes={{ children: 'space-y-6', root: 'col-span-5' }}
        title={isEditing ? 'Edit Assignment' : 'Create New Assignment'}
      >
        <AssignmentEditorForm
          formData={formData}
          isEditing={isEditing}
          key={update}
          onFormDataChange={onFormDataChange}
        />

        <Divider />

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline">
            Cancel
          </Button>
          <Button
            className="gap-2"
            disabled={isEditing ? !edited : false}
            loading={createAssignmentLoading || updateAssignmentLoading}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            {isEditing ? 'Update Assignment' : 'Create Assignment'}
          </Button>
        </div>
      </Card>
      <div className="col-span-2 h-fit sticky top-[80px]">
        <AIChatBoxProvider
          firstMessage="Hi! I'm your AI writing assistant. I can help you polish topics and rubrics for your assignment. What would you like help with?"
          toolId={1}
        >
          <AIChatBox
            chatName="Assignment Create Assistant"
            className="!h-[calc(100vh-140px)]"
          />
        </AIChatBoxProvider>
      </div>
    </div>
  );
}
export default AssignmentEditor;
