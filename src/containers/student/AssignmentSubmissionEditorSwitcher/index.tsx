import React, { useMemo } from 'react';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import AssignmentEssayEditor from 'containers/student/AssignmentEssayEditor';
import AssignmentGoalEditor from 'containers/student/AssignmentGoalEditor';
import AssignmentReflectionEditor from 'containers/student/AssignmentReflectionEditor';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';
import usePageTracking from 'containers/student/AssignmentSubmissionEditorSwitcher/usePageTracking';

const AssignmentSubmissionEditorSwitcher = () => {
  const { assignmentProgress, isLoading, error, currentStage } =
    useAssignmentSubmissionProvider();

  usePageTracking(assignmentProgress);

  const ele = useMemo(() => {
    if (!assignmentProgress) {
      return <></>;
    }

    if (!currentStage) {
      return (
        <ErrorComponent
          className="py-10"
          error="System error. Failed to get current stage."
        />
      );
    }

    if (currentStage.stage_type === 'reading') {
      return <>WIP</>;
    }

    if (currentStage.stage_type === 'goal_setting') {
      return <AssignmentGoalEditor />;
    }

    if (currentStage.stage_type === 'language_preparation') {
      return <>WIP</>;
    }

    if (
      currentStage.stage_type === 'outlining' ||
      currentStage.stage_type === 'drafting' ||
      currentStage.stage_type === 'revising'
    ) {
      return <AssignmentEssayEditor />;
    }

    if (currentStage.stage_type === 'reflection') {
      return <AssignmentReflectionEditor />;
    }

    return (
      <ErrorComponent className="py-10" error="System error. Invalid stage." />
    );
  }, [assignmentProgress, currentStage]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !assignmentProgress) {
    return (
      <ErrorComponent
        className="py-10"
        error={error || 'Failed to fetch assignment'}
      />
    );
  }

  return <>{ele}</>;
};

export default AssignmentSubmissionEditorSwitcher;
