import React from 'react';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import TeacherHeader from 'containers/teacher/TeacherHeader';

const TraceLogsPage = () => {
  return (
    <AuthPageWrapper isAdminPage>
      <TeacherHeader />
      <div className="px-6 py-4 max-w-6xl mx-auto mb-10">
        <div className="mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Student Trace Logs</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Export and analyze student activity data
          </p>
        </div>
        {/* TODO: add this */}
        <div>Coming Soon!</div>
      </div>
    </AuthPageWrapper>
  );
};

export default TraceLogsPage;
