import React from 'react';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import useAuth from 'containers/auth/AuthProvider/useAuth';
import UserEditForm from 'containers/common/UserEditForm';
import StudentHeader from 'containers/student/StudentHeader';
import TeacherHeader from 'containers/teacher/TeacherHeader';

const ProfilePage = () => {
  const { role } = useAuth();

  return (
    <AuthPageWrapper>
      {role === 'student' ? <StudentHeader /> : <TeacherHeader />}
      <div className="p-6 max-w-3xl mx-auto mb-10">
        <h3 className="text-2xl font-semibold mb-4">My Profile</h3>
        <UserEditForm />
      </div>
    </AuthPageWrapper>
  );
};

export default ProfilePage;
