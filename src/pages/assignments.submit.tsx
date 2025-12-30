import React from 'react';

import { isNumber, isString, parseInt } from 'lodash-es';
import { useParams } from 'react-router';

import ErrorComponent from 'components/display/ErrorComponent';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import AssignmentSubmissionEditorSwitcher from 'containers/student/AssignmentSubmissionEditorSwitcher';
import AssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider';
import StudentHeader from 'containers/student/StudentHeader';

// import { apiGetGptChatLogs } from 'api/gpt';

const AssignmentSubmitPage = () => {
  const { id } = useParams();
  // const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const assignmentId =
    isString(id) && isNumber(parseInt(id, 10)) ? parseInt(id, 10) : undefined;

  // const onBack = useCallback(async () => {
  //   await queryClient.invalidateQueries([apiGetGptChatLogs.queryKey]);
  //   navigate(pathnames.home());
  // }, [navigate, queryClient]);

  if (!isNumber(assignmentId)) {
    return <ErrorComponent error="Missing assignment ID" />;
  }

  return (
    <AuthPageWrapper isStudentPage>
      <AssignmentSubmissionProvider assignmentId={assignmentId}>
        <StudentHeader />
        <div className="px-6 py-4 max-w-full mx-auto mb-10">
          {/* <Button className="gap-2 mb-4" onClick={onBack} variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Button> */}
          {isNumber(assignmentId) ? (
            <AssignmentSubmissionEditorSwitcher />
          ) : (
            <ErrorComponent className="py-10" error="Missing assignment ID" />
          )}
        </div>
      </AssignmentSubmissionProvider>
    </AuthPageWrapper>
  );
};

export default AssignmentSubmitPage;
