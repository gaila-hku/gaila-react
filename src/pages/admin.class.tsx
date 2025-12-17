import React from 'react';

import ClassCreateButton from 'containers/admin/ClassCreateButton';
import ClassListing from 'containers/admin/ClassListing';
import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import TeacherHeader from 'containers/teacher/TeacherHeader';

const ClassManagementPage = () => {
  return (
    <AuthPageWrapper isAdminPage>
      <TeacherHeader />
      <div className="px-6 py-4 max-w-6xl mx-auto mb-10">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Class Management</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Create and manage classes, students, and teachers
            </p>
          </div>
          <div>
            <ClassCreateButton />
          </div>
        </div>
        <ClassListing />
      </div>
    </AuthPageWrapper>
  );
};

export default ClassManagementPage;
