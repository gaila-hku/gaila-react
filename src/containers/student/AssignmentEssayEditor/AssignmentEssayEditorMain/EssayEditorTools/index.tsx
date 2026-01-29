import React, { useCallback, useMemo } from 'react';

import { useQuery } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import EssayEditorAutoGradeTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorAutoGradeTool';
import EssayEditorDictionaryTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorDictionaryTool';
import EssayEditorIdeationGuidingTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorIdeationGuidingTool';
import EssayEditorOutlineReviewTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorOutlineReviewTool';
import EssayEditorRevisionTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorRevisionTool';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGetLatestSturcturedGptLog } from 'api/gpt';
import type { GptLog } from 'types/gpt';
import tuple from 'utils/types/tuple';

const EssayEditorTools = () => {
  const { outliningEnabled, revisingEnabled } =
    useAssignmentSubmissionProvider();
  const { essay, currentStage, outlineConfirmed, draftConfirmed } =
    useAssignmentEssayEditorProvider();

  const [
    tools,
    ideationGuidingTool,
    outlineReviewTool,
    dictionaryTool,
    autoGradeTool,
    revisionTool,
  ] = useMemo(() => {
    const tools = currentStage?.tools ?? [];
    const ideationGuidingTool = tools.find(
      tool => tool.key === 'ideation_guiding' && tool.enabled,
    );
    const outlineReviewTool = tools.find(
      tool => tool.key === 'outline_review' && tool.enabled,
    );
    const dictionaryTool = tools.find(
      tool => tool.key === 'dictionary' && tool.enabled,
    );
    const autoGradeTool = tools.find(
      tool => tool.key === 'autograde' && tool.enabled,
    );
    const revisionTool = tools.find(
      tool => tool.key === 'revision' && tool.enabled,
    );
    return [
      tools,
      ideationGuidingTool,
      outlineReviewTool,
      dictionaryTool,
      autoGradeTool,
      revisionTool,
    ];
  }, [currentStage]);

  const { data, isLoading, error } = useQuery(
    tuple([
      apiGetLatestSturcturedGptLog.queryKey,
      { assignment_tool_ids: tools.map(tool => tool.id) },
    ]),
    apiGetLatestSturcturedGptLog,
  );

  const latestResult = useMemo(() => {
    if (!data) {
      return {};
    }
    return data.reduce(
      (obj, log) => {
        obj[log.assignment_tool_id] = log;
        return obj;
      },
      {} as Record<number, GptLog>,
    );
  }, [data]);

  const availableTools = useMemo(() => {
    return [
      ...(!!ideationGuidingTool &&
      (!outlineConfirmed || !outliningEnabled) &&
      (!draftConfirmed || !revisingEnabled)
        ? ['ideation_guiding']
        : []),
      ...(!!outlineReviewTool &&
      outliningEnabled &&
      !outlineConfirmed &&
      (!draftConfirmed || !revisingEnabled)
        ? ['outline_review']
        : []),
      ...(dictionaryTool ? ['dictionary'] : []),
      ...(!!autoGradeTool && (outlineConfirmed || !outliningEnabled)
        ? ['autograde']
        : []),
      ...(!!revisionTool &&
      (outlineConfirmed || !outliningEnabled) &&
      (draftConfirmed || !revisingEnabled)
        ? ['revision']
        : []),
    ];
  }, [
    ideationGuidingTool,
    outlineConfirmed,
    outliningEnabled,
    draftConfirmed,
    revisingEnabled,
    outlineReviewTool,
    dictionaryTool,
    autoGradeTool,
    revisionTool,
  ]);

  const renderTool = useCallback(
    (toolKey: string) => {
      switch (toolKey) {
        case 'ideation_guiding':
          return (
            <EssayEditorIdeationGuidingTool
              latestResult={latestResult[ideationGuidingTool!.id] || null}
              toolId={ideationGuidingTool!.id}
            />
          );
        case 'outline_review':
          return (
            <EssayEditorOutlineReviewTool
              latestResult={latestResult[outlineReviewTool!.id] || null}
              toolId={outlineReviewTool!.id}
            />
          );
        case 'dictionary':
          return (
            <EssayEditorDictionaryTool
              latestResult={latestResult[dictionaryTool!.id] || null}
              toolId={dictionaryTool!.id}
            />
          );
        case 'autograde':
          return (
            <EssayEditorAutoGradeTool
              essay={essay}
              latestResult={latestResult[autoGradeTool!.id] || null}
              toolId={autoGradeTool!.id}
            />
          );
        case 'revision':
          return (
            <EssayEditorRevisionTool
              essay={essay}
              latestLog={latestResult[revisionTool!.id] || null}
              toolId={revisionTool!.id}
            />
          );
        default:
          return null;
      }
    },
    [
      autoGradeTool,
      dictionaryTool,
      essay,
      latestResult,
      ideationGuidingTool,
      outlineReviewTool,
      revisionTool,
    ],
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <div className="space-y-4">
      {availableTools.map(toolKey => (
        <React.Fragment key={toolKey}>{renderTool(toolKey)}</React.Fragment>
      ))}
      {!availableTools.length && (
        <div className="text-center text-sm text-muted-foreground">
          No tools available for this stage.
        </div>
      )}
    </div>
  );
};

export default EssayEditorTools;
