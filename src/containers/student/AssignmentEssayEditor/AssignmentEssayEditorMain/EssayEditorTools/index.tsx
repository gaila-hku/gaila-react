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

import { apiGetLatestSturcturedGptLog } from 'api/gpt';
import tuple from 'utils/types/tuple';

const EssayEditorTools = () => {
  const { assignment, essay, currentStage, outlineConfirmed, draftConfirmed } =
    useAssignmentEssayEditorProvider();

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

  const { data, isLoading, error } = useQuery(
    tuple([
      apiGetLatestSturcturedGptLog.queryKey,
      { assignment_tool_ids: tools.map(tool => tool.id) },
    ]),
    apiGetLatestSturcturedGptLog,
  );

  const getLatestResult = useCallback(
    (toolId: number) => {
      if (!data) {
        return null;
      }
      const result = data.find(log => log.assignment_tool_id === toolId);
      return result || null;
    },
    [data],
  );

  const availableTools = useMemo(() => {
    return [
      ...(!!ideationGuidingTool &&
      (!outlineConfirmed || !assignment?.config?.outline_enabled) &&
      (!draftConfirmed || !assignment?.config?.revision_enabled)
        ? ['ideation_guiding']
        : []),
      ...(!!outlineReviewTool &&
      (!outlineConfirmed || !assignment?.config?.outline_enabled) &&
      (!draftConfirmed || !assignment?.config?.revision_enabled)
        ? ['outline_review']
        : []),
      ...(dictionaryTool ? ['dictionary'] : []),
      ...(!!autoGradeTool &&
      (outlineConfirmed || !assignment?.config?.outline_enabled)
        ? ['autograde']
        : []),
      ...(!!revisionTool &&
      (outlineConfirmed || !assignment?.config?.outline_enabled) &&
      (draftConfirmed || !assignment?.config?.revision_enabled)
        ? ['revision']
        : []),
    ];
  }, [
    assignment?.config?.outline_enabled,
    assignment?.config?.revision_enabled,
    autoGradeTool,
    dictionaryTool,
    draftConfirmed,
    ideationGuidingTool,
    outlineReviewTool,
    outlineConfirmed,
    revisionTool,
  ]);

  const renderTool = useCallback(
    (toolKey: string) => {
      switch (toolKey) {
        case 'ideation_guiding':
          return (
            <EssayEditorIdeationGuidingTool
              latestResult={getLatestResult(ideationGuidingTool!.id)}
              toolId={ideationGuidingTool!.id}
            />
          );
        case 'outline_review':
          return (
            <EssayEditorOutlineReviewTool
              latestResult={getLatestResult(outlineReviewTool!.id)}
              toolId={outlineReviewTool!.id}
            />
          );
        case 'dictionary':
          return (
            <EssayEditorDictionaryTool
              latestResult={getLatestResult(dictionaryTool!.id)}
              toolId={dictionaryTool!.id}
            />
          );
        case 'autograde':
          return (
            <EssayEditorAutoGradeTool
              essay={essay}
              latestResult={getLatestResult(autoGradeTool!.id)}
              toolId={autoGradeTool!.id}
            />
          );
        case 'revision':
          return (
            <EssayEditorRevisionTool
              essay={essay}
              latestLog={getLatestResult(revisionTool!.id)}
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
      getLatestResult,
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
