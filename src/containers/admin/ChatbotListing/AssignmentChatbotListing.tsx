import React, { useState } from 'react';

import { isNumber } from 'lodash-es';
import { ArrowLeft, Bot, Edit, FileText } from 'lucide-react';
import { useQuery } from 'react-query';

import Card from 'components/display/Card';
import Empty from 'components/display/Empty';
import ErrorMessage from 'components/display/ErrorMessage';
import InfiniteList from 'components/display/InfiniteList';
import Loading from 'components/display/Loading';
import Button from 'components/input/Button';

import AssignmentToolEditModal from 'containers/admin/ChatbotListing/AssignmentToolEditModal';

import { apiGetAssignments, apiGetAssignmentTools } from 'api/assignment';
import type { AssignmentTool } from 'types/assignment';
import tuple from 'utils/types/tuple';

const AssignmentChatbotListing = () => {
  const [activeAssignmentId, setActiveAssignmentId] = useState<number | null>(
    null,
  );

  const [editingTool, setEditingTool] = useState<AssignmentTool | null>(null);

  const {
    data: tools,
    isLoading: isToolLoading,
    error: toolError,
  } = useQuery(
    tuple([
      apiGetAssignmentTools.queryKey,
      { assignment_id: activeAssignmentId! },
    ]),
    apiGetAssignmentTools,
    {
      enabled: isNumber(activeAssignmentId),
    },
  );

  return (
    <>
      {activeAssignmentId ? (
        <>
          <Button
            className="gap-2 mb-4"
            onClick={() => setActiveAssignmentId(null)}
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Button>

          {isToolLoading ? (
            <Loading />
          ) : tools ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(item => (
                <Card className="h-fit" key={item.id}>
                  <div className="flex">
                    <div className="flex-1 flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg leading-none break-all">
                          {item.tool_key}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-[0_0_36px] flex gap-1">
                      <Button
                        onClick={() => setEditingTool(item)}
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
          ) : (
            <Empty />
          )}
          <ErrorMessage error={toolError} />
        </>
      ) : (
        <>
          <h2>Assignments</h2>
          <p className="text-muted-foreground mb-1">
            Choose an assignment first
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfiniteList
              emptyPlaceholder={
                <div className="text-center py-12 col-span-3">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-lg mb-2">
                    You do not have any assignments yet
                  </div>
                </div>
              }
              queryFn={apiGetAssignments}
              queryKey={[
                apiGetAssignments.queryKey,
                { page: 1, limit: 10, filter: { search: '' } },
              ]}
              renderItem={assignment => (
                <Card className="h-fit" key={assignment.id}>
                  <div className="flex">
                    <div className="flex-1 flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg leading-none break-all">
                          {assignment.title}
                        </h3>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {assignment.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex-[0_0_36px] flex gap-1">
                      <Button
                        onClick={() => setActiveAssignmentId(assignment.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            />
          </div>
        </>
      )}
      <AssignmentToolEditModal
        assignmentTool={editingTool}
        setAssignmentTool={setEditingTool}
      />
    </>
  );
};

export default AssignmentChatbotListing;
