import React, { useMemo, useState } from 'react';

import { useQuery } from 'react-query';

import SelectInput from 'components/input/SelectInput';

import AssignmentEssayEditorAnalytics from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorAnalytics';
import AssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider';
import AssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider';

import { apiGetAssignmentOptions } from 'api/assignment';
import tuple from 'utils/types/tuple';

const StudentDashboard = () => {
  const [assignmentId, setAssignmentId] = useState(1);

  const { data: options } = useQuery(
    tuple([apiGetAssignmentOptions.queryKey]),
    apiGetAssignmentOptions,
  );

  const selectOptions = useMemo(() => {
    if (!options) {
      return [];
    }
    return options.map(option => ({
      value: option.id,
      label: option.title,
    }));
  }, [options]);

  console.log(selectOptions);

  return (
    <>
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Track your writing progress and AI usage patterns
        </p>
      </div>
      <SelectInput
        className="w-120 !mb-8"
        onChange={setAssignmentId}
        options={selectOptions}
        value={assignmentId}
      />
      {!!assignmentId && (
        <AssignmentSubmissionProvider assignmentId={assignmentId}>
          <AssignmentEssayEditorProvider>
            <AssignmentEssayEditorAnalytics assignmentId={assignmentId} />
          </AssignmentEssayEditorProvider>
        </AssignmentSubmissionProvider>
      )}
    </>
  );
};

export default StudentDashboard;
