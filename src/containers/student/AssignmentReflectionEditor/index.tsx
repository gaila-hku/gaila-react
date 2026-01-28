import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivitySquare,
  ArrowRight,
  FileCheck,
  FileText,
  MessageSquare,
  Save,
} from 'lucide-react';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';
import Tabs from 'components/navigation/Tabs';

import AIChatBox from 'containers/common/AIChatBox';
import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import useAlert from 'containers/common/AlertProvider/useAlert';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import AssignmentReflectionEditorDashboard from 'containers/student/AssignmentReflectionEditor/AssignmentReflectionEditorDashboard';
import AssignmentReflectionEditorGeneratedDashboard from 'containers/student/AssignmentReflectionEditor/AssignmentReflectionEditorGeneratedDashboard';
import REFLECTION_QUESTIONS from 'containers/student/AssignmentReflectionEditor/reflectionQuestions';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type {
  AssignmentReflectionContent,
  AssignmentStageReflection,
} from 'types/assignment';

const AssignmentReflectionEditor = () => {
  const {
    assignmentProgress,
    currentStage,
    saveSubmission,
    isSaving,
    readonly,
  } = useAssignmentSubmissionProvider();

  const { alertMsg } = useAlert();

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
        content: { reflections },
        is_final: isFinal,
        alertMsg: isManual ? 'Reflections draft saved.' : undefined,
        changeStage: isFinal,
      });
    },
    [alertMsg, assignmentProgress, currentStage, reflections, saveSubmission],
  );

  const generalChatTool = currentStage?.tools.find(
    tool => tool.key === 'reflection_general',
  );

  const onInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.relatedTarget?.tagName === 'BUTTON') {
        return;
      }
      handleSubmit(false, false);
    },
    [handleSubmit],
  );

  useEffect(() => {
    if (currentStage?.submission?.content) {
      setReflections(
        (currentStage.submission.content as AssignmentReflectionContent)
          .reflections,
      );
    }
  }, [currentStage]);

  if (!assignmentProgress || !currentStage) {
    return <></>;
  }

  const reflectionQuestions =
    (
      currentStage as AssignmentStageReflection
    ).config.reflection_questions?.map(question => ({
      question,
      placeholder:
        REFLECTION_QUESTIONS.find(q => q.question === question)?.placeholder ||
        '',
    })) || REFLECTION_QUESTIONS;
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileCheck className="h-8 w-8 text-primary" />
          Reflection
        </h1>
        <p className="text-muted-foreground">
          Great work on completing {assignmentProgress.assignment.title}!
          Let&apos;s reflect on your writing process.
        </p>
      </div>

      <ResizableSidebar className="mb-6">
        <div>
          <Tabs
            tabs={[
              {
                key: 'ai-interaction',
                title: (
                  <div className="flex items-center gap-2">
                    <ActivitySquare className="h-4 w-4" />
                    AI Interaction
                  </div>
                ),
                content: (
                  <div className="h-[calc(100vh-320px)] space-y-6 overflow-auto pr-4">
                    <AssignmentReflectionEditorDashboard
                      assignmentId={assignmentProgress.assignment.id}
                    />
                  </div>
                ),
              },
              {
                key: 'writing-process',
                title: (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Writing Process
                  </div>
                ),
                content: <AssignmentReflectionEditorGeneratedDashboard />,
              },
            ]}
          />
        </div>

        {/* Right Side - AI Chat */}
        {generalChatTool && (
          <AIChatBoxProvider
            firstMessage="Hello! I'm your Reflection Assistant. I'm here to help you think about your writing process. Feel free to ask me questions about writing evaluations, best writing practices, and ways to improve for your next essay."
            toolId={generalChatTool.id}
          >
            <AIChatBox
              chatName="Reflection Assistant"
              description="Ask me anything about reflecting on writing goals"
              placeholder="Ask about reflections..."
            />
          </AIChatBoxProvider>
        )}
      </ResizableSidebar>

      {/* Bottom - Reflection Questions Form */}
      {reflectionQuestions.length > 0 && (
        <Card
          classes={{
            title: 'flex items-center gap-2',
            description: '-mt-2 mb-2',
            children: 'space-y-6',
          }}
          description="Reflect on your learning experience and writing journey"
          title={
            <>
              <MessageSquare className="h-5 w-5" />
              Reflection Questions
            </>
          }
        >
          {reflectionQuestions.map((question, index) => (
            <div className="space-y-2" key={index}>
              <label className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="font-medium">{question.question}</span>
              </label>
              <TextInput
                className="resize-none"
                disabled={readonly}
                multiline
                onBlur={onInputBlur}
                onChange={e => handleReflectionChange(index, e.target.value)}
                placeholder={question.placeholder}
                rows={3}
                value={reflections[index] || ''}
              />
            </div>
          ))}
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4 mt-4">
        {reflectionQuestions.length > 0 && (
          <Button
            className="gap-2"
            disabled={readonly || isSaving}
            onClick={() => handleSubmit(false, true)}
            size="lg"
            variant="secondary"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        )}
        <Button
          className="gap-2"
          disabled={readonly || isSaving}
          onClick={() => handleSubmit(true, true)}
          size="lg"
        >
          Finish Reflection
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default AssignmentReflectionEditor;
