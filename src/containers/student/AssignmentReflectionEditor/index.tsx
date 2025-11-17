import React, { useCallback, useEffect, useState } from 'react';

import {
  ArrowRight,
  CheckCircle,
  FileCheck,
  MessageSquare,
  Save,
} from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';
import Tabs from 'components/navigation/Tabs';

import AIChatBox from 'containers/common/AIChatBox.tsx';
import useAlert from 'containers/common/AlertProvider/useAlert';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import AssignmentReflectionStatistics from 'containers/student/AssignmentReflectionEditor/AssignmentReflectionStatistics';
import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import {
  apiSaveAssignmentSubmission,
  apiViewAssignmentProgress,
} from 'api/assignment';
import type { AssignmentReflectionContent } from 'types/assignment';

const AssignmentReflectionEditor = () => {
  const { assignmentProgress, currentStage } =
    useAssignmentSubmissionProvider();

  const queryClient = useQueryClient();
  const { alertMsg, successMsg, errorMsg } = useAlert();

  const { mutate: saveSubmission } = useMutation(apiSaveAssignmentSubmission, {
    onSuccess: async (res, req) => {
      if (res.is_final) {
        await queryClient.invalidateQueries([
          apiViewAssignmentProgress.queryKey,
        ]);
        return;
      }
      if (req.is_manual) {
        successMsg('Reflection draft saved.');
      }
    },
    onError: errorMsg,
  });

  const [reflections, setReflections] = useState<{ [key: number]: string }>({});

  const handleReflectionChange = (questionId: number, value: string) => {
    setReflections(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = useCallback(
    (isFinal: boolean, isManual: boolean) => {
      if (!assignmentProgress || !currentStage) {
        return;
      }

      const answeredCount = Object.values(reflections).filter(r =>
        r?.trim(),
      ).length;

      if (isFinal && answeredCount === 0) {
        alertMsg(
          'Please answer at least one reflection question before submitting.',
        );
        return;
      }

      saveSubmission({
        assignment_id: assignmentProgress.assignment.id,
        stage_id: currentStage.id,
        content: JSON.stringify(reflections),
        is_final: isFinal,
        is_manual: isManual,
      });
    },
    [alertMsg, assignmentProgress, currentStage, reflections, saveSubmission],
  );

  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === 'reflection_general',
  );

  useEffect(() => {
    if (currentStage?.submission?.content) {
      setReflections(
        currentStage.submission.content as AssignmentReflectionContent,
      );
    }
  }, [currentStage]);

  if (!assignmentProgress || !currentStage) {
    return <></>;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2">
          <FileCheck className="h-8 w-8 text-primary" />
          Essay Reflection
        </h1>
        <p className="text-muted-foreground">
          Great work on completing {assignmentProgress.assignment.title}!
          Let&apos;s reflect on your writing process.
        </p>
      </div>

      <ResizableSidebar initWidth={500} maxWidth={800} minWidth={400}>
        <div className="space-y-6">
          {/* Reflection Questions */}
          <Card
            classes={{
              title: 'flex items-center gap-2 -mb-2',
              header: 'mb-4',
              children: 'space-y-6',
            }}
            description="Take a moment to reflect on your writing process and what you learned."
            title={
              <>
                <MessageSquare className="h-5 w-5" />
                Reflection Questions
              </>
            }
          >
            {REFLECTION_QUESTIONS.map((question, index) => (
              <div className="space-y-2" key={question.id}>
                <label className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{question.question}</span>
                </label>
                <TextInput
                  className="resize-none"
                  multiline
                  onBlur={() => handleSubmit(false, false)}
                  onChange={e =>
                    handleReflectionChange(question.id, e.target.value)
                  }
                  placeholder={question.placeholder}
                  rows={3}
                  value={reflections[question.id] || ''}
                />
              </div>
            ))}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              className="gap-2"
              onClick={() => handleSubmit(false, true)}
              size="lg"
              variant="secondary"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              className="gap-2"
              onClick={() => handleSubmit(true, true)}
              size="lg"
            >
              Submit
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs
          tabs={[
            {
              key: 'statistics',
              title: 'Statistics',
              content: (
                <AssignmentReflectionStatistics
                  assignmentProgress={assignmentProgress}
                />
              ),
            },
            ...(generalChatTool
              ? [
                  {
                    key: 'chat',
                    title: 'AI Chat',
                    content: (
                      <AIChatBox
                        chatName="Reflection Assistant"
                        description="Ask me anything about reflecting on writing goals"
                        firstMessage="Hello! I'm your Reflection Assistant. I'm here to help you think deeply about your writing process. Feel free to ask me questions about writing evaluations, best writing practices, and ways to improve for your next essay."
                        placeholder="Ask about reflections..."
                        toolId={generalChatTool.id}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </ResizableSidebar>

      <Card
        className="bg-primary text-primary-foreground"
        classes={{ title: 'flex items-center gap-2', root: 'mt-6' }}
        title={
          <>
            <CheckCircle className="h-5 w-5" />
            Well Done!
          </>
        }
      >
        <p className="text-sm text-primary-foreground/90">
          You&apos;ve completed your essay and reflected on your writing
          process. This self-awareness will help you become a better writer.
          Keep up the great work!
        </p>
      </Card>
    </>
  );
};

export default AssignmentReflectionEditor;
