import React from 'react';

import Tabs from 'components/navigation/Tabs';

import ChatbotListing from 'containers/admin/ChatbotListing';
import AssignmentChatbotListing from 'containers/admin/ChatbotListing/AssignmentChatbotListing';
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

        <Tabs
          tabs={[
            {
              key: 'general',
              title: 'General Configurations',
              content: <ChatbotListing />,
            },
            {
              key: 'assignment',
              title: 'Assignment-specific Configurations',
              content: <AssignmentChatbotListing />,
            },
          ]}
        />
      </div>
    </AuthPageWrapper>
  );
};

export default AgentConfigurationPage;
