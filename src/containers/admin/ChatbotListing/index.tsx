import React, { useState } from 'react';

import { Bot, Edit } from 'lucide-react';
import { useQuery } from 'react-query';

import Card from 'components/display/Card';
import Empty from 'components/display/Empty';
import ErrorMessage from 'components/display/ErrorMessage';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';

import ChatbotSettingEditModal from 'containers/admin/ChatbotListing/ChatbotEditModal';

import { apiGetChatbotTemplates } from 'api/chatbotSetting';
import type { ChatbotTemplate } from 'types/chatbot';
import tuple from 'utils/types/tuple';

const ChatbotListing = () => {
  const [editingTemplate, setEditingTemplate] =
    useState<ChatbotTemplate | null>(null);

  const { data, isLoading, error } = useQuery(
    tuple([apiGetChatbotTemplates.queryKey]),
    apiGetChatbotTemplates,
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data) {
    return <Empty />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(item => (
          <Card className="h-fit" key={item.id}>
            <div className="flex">
              <div className="flex-1 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg leading-none break-all">
                    {item.name}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
              <div className="flex-[0_0_36px] flex gap-1">
                <Button
                  onClick={() => setEditingTemplate(item)}
                  size="sm"
                  variant="ghost"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <ChatbotSettingEditModal
        chatbotTemplate={editingTemplate}
        setChatbotTemplate={setEditingTemplate}
      />
    </>
  );
};

export default ChatbotListing;
