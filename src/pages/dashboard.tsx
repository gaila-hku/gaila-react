import React from 'react';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import useAuth from 'containers/auth/AuthProvider/useAuth';
import StudentDashboard from 'containers/student/StudentDashboard';
import StudentHeader from 'containers/student/StudentHeader';
import TeacherDashboard from 'containers/teacher/TeacherDashboard';
import TeacherHeader from 'containers/teacher/TeacherHeader';

const DashboardPage = () => {
  const { role } = useAuth();

  return (
    <AuthPageWrapper>
      {role === 'student' ? (
        <>
          <StudentHeader />
          <div className="p-6 max-w-full mx-auto mb-10">
            <StudentDashboard />
          </div>
        </>
      ) : (
        <>
          <TeacherHeader />
          <div className="p-6 max-w-full mx-auto mb-10">
            <TeacherDashboard />
          </div>
        </>
      )}
    </AuthPageWrapper>
  );
};

export default DashboardPage;
