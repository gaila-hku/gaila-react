import React, { useCallback } from 'react';

import { useQuery } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import EssayEditorAutoGradeTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorAutoGradeTool';
import EssayEditorDictionaryTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorDictionaryTool';
import EssayEditorIdeationTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorIdeationTool';
import EssayEditorRevisionTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorRevisionTool';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiGetLatestSturcturedGptLog } from 'api/gpt';
import tuple from 'utils/types/tuple';

const EssayEditorTools = () => {
  const { essay, currentStage, outlineConfirmed, draftConfirmed } =
    useAssignmentEssayEditorProvider();

  const tools = currentStage?.tools ?? [];
  const ideationTool = tools.find(tool => tool.key === 'ideation');
  const dictionaryTool = tools.find(tool => tool.key === 'dictionary');
  const autoGradeTool = tools.find(tool => tool.key === 'autograde');
  const revisionTool = tools.find(tool => tool.key === 'revision');

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

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <div className="space-y-4">
      {!!ideationTool && !outlineConfirmed && (
        <EssayEditorIdeationTool
          latestResult={getLatestResult(ideationTool.id)}
          toolId={ideationTool.id}
        />
      )}
      {!!dictionaryTool && (
        <EssayEditorDictionaryTool
          latestResult={getLatestResult(dictionaryTool.id)}
          toolId={dictionaryTool.id}
        />
      )}
      {!!autoGradeTool && outlineConfirmed && (
        <EssayEditorAutoGradeTool
          essay={essay}
          latestResult={getLatestResult(autoGradeTool.id)}
          toolId={autoGradeTool.id}
        />
      )}
      {!!revisionTool && draftConfirmed && (
        <EssayEditorRevisionTool
          essay={essay}
          latestResult={getLatestResult(revisionTool.id)}
          toolId={revisionTool.id}
        />
      )}
    </div>
  );
};

export default EssayEditorTools;
