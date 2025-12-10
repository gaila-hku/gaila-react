import React from 'react';

import { Bot, School, ScrollText, Users } from 'lucide-react';
import { useQuery } from 'react-query';

import Button from 'components/input/Button';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import useAlert from 'containers/common/AlertProvider/useAlert';
import TeacherHeader from 'containers/teacher/TeacherHeader';

import { apiGetVersion } from 'api/common';
import tuple from 'utils/types/tuple';

const AdminPortalPage = () => {
  const { alertMsg } = useAlert();

  const { data: versionData } = useQuery(
    tuple([apiGetVersion.queryKey]),
    apiGetVersion,
  );

  return (
    <AuthPageWrapper isAdminPage>
      <TeacherHeader />
      <div className="px-6 py-4 max-w-6xl mx-auto mb-10">
        <div className="mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Site Management</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage site settings and configurations
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            className="gap-2 !h-16"
            onClick={() => alertMsg('Coming Soon!')}
            size="lg"
            variant="outline"
          >
            <Users className="!h-5 !w-5" />
            User Management
          </Button>
          <Button
            className="gap-2 !h-16"
            onClick={() => alertMsg('Coming Soon!')}
            size="lg"
            variant="outline"
          >
            <School className="!h-5 !w-5" />
            Class Management
          </Button>
          <Button
            className="gap-2 !h-16"
            onClick={() => alertMsg('Coming Soon!')}
            size="lg"
            variant="outline"
          >
            <Bot className="!h-5 !w-5" />
            Agents Configurations
          </Button>
          <Button
            className="gap-2 !h-16"
            onClick={() => alertMsg('Coming Soon!')}
            size="lg"
            variant="outline"
          >
            <ScrollText className="!h-5 !w-5" />
            Full Student Trace Logs
          </Button>
        </div>
        <div className="pt-4 text-sm text-muted-foreground">
          Version: {versionData?.version || '-'}
        </div>
      </div>
    </AuthPageWrapper>
  );
};

export default AdminPortalPage;
