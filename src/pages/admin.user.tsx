import React from 'react';

import Tabs from 'components/navigation/Tabs';

import UserListing from 'containers/admin/UserListing';
import UserUploader from 'containers/admin/UserUploader';
import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import TeacherHeader from 'containers/teacher/TeacherHeader';

const UserManagementPage = () => {
  return (
    <AuthPageWrapper isAdminPage>
      <TeacherHeader />
      <div className="px-6 py-4 max-w-6xl mx-auto mb-10">
        <div className="mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Create, modify, and manage user accounts
          </p>
        </div>
        <Tabs
          tabs={[
            { key: 'listing', title: 'Manage Users', content: <UserListing /> },
            {
              key: 'upload',
              title: 'Upload Users (CSV)',
              content: <UserUploader />,
            },
          ]}
        />
      </div>
    </AuthPageWrapper>
  );
};

export default UserManagementPage;
