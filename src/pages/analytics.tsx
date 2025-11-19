import React from 'react';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import useAuth from 'containers/auth/AuthProvider/useAuth';
import StudentDashboard from 'containers/student/StudentDashboard';
import StudentHeader from 'containers/student/StudentHeader';
import TeacherHeader from 'containers/teacher/TeacherHeader';

const AnalyticsPage = () => {
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
          Analytics Page
        </>
      )}
    </AuthPageWrapper>
  );
};

export default AnalyticsPage;
