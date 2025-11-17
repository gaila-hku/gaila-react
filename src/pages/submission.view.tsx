import React, { useCallback } from 'react';

import { isNumber, isString, parseInt } from 'lodash-es';
import { ArrowLeft, Edit } from 'lucide-react';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router';
import { pathnames } from 'routes';

import ErrorComponent from 'components/display/ErrorComponent';
import Button from 'components/input/Button';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import SubmissionDetails from 'containers/teacher/SubmissionDetails';
import TeacherHeader from 'containers/teacher/TeacherHeader';

import { apiGetGptChatLogs } from 'api/gpt';

const SubmissionViewPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { assignmentId, studentId } = useParams();

  const assignmentIdNumber =
    isString(assignmentId) && isNumber(parseInt(assignmentId, 10))
      ? parseInt(assignmentId, 10)
      : undefined;
  const studentIdNumber =
    isString(studentId) && isNumber(parseInt(studentId, 10))
      ? parseInt(studentId, 10)
      : undefined;

  const onBack = useCallback(async () => {
    await queryClient.invalidateQueries([apiGetGptChatLogs.queryKey]);
    navigate(pathnames.assignments());
  }, [navigate, queryClient]);

  return (
    <AuthPageWrapper isTeacherPage>
      <TeacherHeader />
      <div className="p-6 max-w-full mx-auto">
        {isNumber(assignmentIdNumber) && isNumber(studentIdNumber) ? (
          <>
            <Button className="gap-2 mb-4" onClick={onBack} variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Back to Assignments
            </Button>

            <SubmissionDetails
              assignmentId={assignmentIdNumber}
              studentId={studentIdNumber}
            />
          </>
        ) : (
          <ErrorComponent error="Invalid assignment ID or student ID" />
        )}
      </div>
    </AuthPageWrapper>
  );
};

export default SubmissionViewPage;
