import React from 'react';

import AuthPageWrapper from 'containers/auth/AuthPageWrapper';
import TeacherHeader from 'containers/teacher/TeacherHeader';

const AgentConfigurationPage = () => {
  return (
    <AuthPageWrapper isAdminPage>
      <TeacherHeader />
      <div className="px-6 py-4 max-w-6xl mx-auto mb-10">
        <div className="mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Agents Configuration
          </h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Configure default settings for AI chatbot assistants
          </p>
        </div>
        <div></div>
      </div>
    </AuthPageWrapper>
  );
};

export default AgentConfigurationPage;
