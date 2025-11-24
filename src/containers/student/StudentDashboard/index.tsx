import React, { useEffect, useMemo, useState } from 'react';

import { useMutation, useQuery } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import SelectInput from 'components/input/SelectInput';

import AssignmentEssayEditorDashboard from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorDashboard';
import AssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider';
import AssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider';

import { apiGetAssignmentOptions } from 'api/assignment';
import { apiSaveTraceData } from 'api/trace-data';
import tuple from 'utils/types/tuple';

const StudentDashboard = () => {
  const [assignmentId, setAssignmentId] = useState<number | null>(null);

  const {
    data: options,
    isLoading,
    error,
  } = useQuery(
    tuple([apiGetAssignmentOptions.queryKey]),
    apiGetAssignmentOptions,
  );
  const { mutate: saveTraceData } = useMutation(apiSaveTraceData);

  const selectOptions = useMemo(() => {
    if (!options) {
      return [];
    }
    return options.map(option => ({
      value: option.id,
      label: option.title,
    }));
  }, [options]);

  useEffect(() => {
    if (options && options.length > 0) {
      setAssignmentId(options[0].id);
    }
  }, [options]);

  useEffect(() => {
    if (assignmentId) {
      saveTraceData({
        assignment_id: assignmentId,
        stage_id: null,
        action: 'SWITCH_DASHBOARD_ASSIGNMENT',
        content: JSON.stringify({ assignment_id: assignmentId }),
      });
    }
  }, [assignmentId, saveTraceData]);

  return (
    <>
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Track your writing progress and AI usage patterns
        </p>
      </div>
      {isLoading ? (
        <Loading />
      ) : options ? (
        <>
          <SelectInput
            className="w-120 !mb-8"
            onChange={setAssignmentId}
            options={selectOptions}
            value={assignmentId}
          />
          {!!assignmentId && (
            <AssignmentSubmissionProvider assignmentId={assignmentId}>
              <AssignmentEssayEditorProvider>
                <AssignmentEssayEditorDashboard assignmentId={assignmentId} />
              </AssignmentEssayEditorProvider>
            </AssignmentSubmissionProvider>
          )}
        </>
      ) : (
        <ErrorComponent error={error || 'Failed to get assignments'} />
      )}
    </>
  );
};

export default StudentDashboard;
