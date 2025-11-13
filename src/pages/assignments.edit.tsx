import React, { useCallback } from 'react';

import { isNumber, isString, parseInt } from 'lodash-es';
import { ArrowLeft } from 'lucide-react';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router';
import { pathnames } from 'routes';

import Button from 'components/input/Button';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import AssignmentEditor from 'containers/teacher/AssignmentEditor';
import TeacherHeader from 'containers/teacher/TeacherHeader';

import { apiGetGptChatLogs } from 'api/gpt';

const AssignmentEditPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = useParams();

  const assignmentId =
    isString(id) && isNumber(parseInt(id, 10)) ? parseInt(id, 10) : undefined;

  const onBack = useCallback(async () => {
    await queryClient.invalidateQueries([apiGetGptChatLogs.queryKey]);
    navigate(pathnames.assignments());
  }, [navigate, queryClient]);

  return (
    <AuthPageWrapper isTeacherPage>
      <TeacherHeader />
      <div className="p-6 max-w-full mx-auto">
        <Button className="gap-2 mb-4" onClick={onBack} variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Button>

        <AssignmentEditor assignmentId={assignmentId} onBack={onBack} />
      </div>
    </AuthPageWrapper>
  );
};

export default AssignmentEditPage;
