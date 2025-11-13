import React, { useCallback } from 'react';

import { isNumber, isString, parseInt } from 'lodash-es';
import { ArrowLeft, Edit } from 'lucide-react';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router';
import { pathnames } from 'routes';

import ErrorComponent from 'components/display/ErrorComponent';
import Button from 'components/input/Button';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import AssignmentDetails from 'containers/teacher/AssignmentDetails';
import AutoGradingButton from 'containers/teacher/AssignmentDetails/AutoGradingButton';
import TeacherHeader from 'containers/teacher/TeacherHeader';

import { apiGetGptChatLogs } from 'api/gpt';

const AssignmentViewPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = useParams();

  const assignmentId =
    isString(id) && isNumber(parseInt(id, 10)) ? parseInt(id, 10) : undefined;

  const onBack = useCallback(async () => {
    await queryClient.invalidateQueries([apiGetGptChatLogs.queryKey]);
    navigate(pathnames.assignments());
  }, [navigate, queryClient]);

  const onEdit = useCallback(
    async (id: number) => {
      await queryClient.invalidateQueries([apiGetGptChatLogs.queryKey]);
      navigate(pathnames.assignmentEditDetails(String(id)));
    },
    [navigate, queryClient],
  );

  return (
    <AuthPageWrapper isTeacherPage>
      <TeacherHeader />
      <div className="p-6 max-w-full mx-auto">
        {isNumber(assignmentId) ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button className="gap-2" onClick={onBack} variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Back to Assignments
              </Button>
              <div className="flex gap-2">
                {/* <AutoGradingButton assignmentId={assignmentId} /> */}
                <Button className="gap-2" onClick={() => onEdit(assignmentId)}>
                  <Edit className="h-4 w-4" />
                  Edit Assignment
                </Button>
              </div>
            </div>

            <AssignmentDetails assignmentId={assignmentId} />
          </>
        ) : (
          <ErrorComponent />
        )}
      </div>
    </AuthPageWrapper>
  );
};

export default AssignmentViewPage;
