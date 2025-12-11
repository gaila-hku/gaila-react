import React, { useCallback } from 'react';

import { useQuery } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import EssayEditorAutoGradeTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorAutoGradeTool';
import EssayEditorDictionaryTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorDictionaryTool';
import EssayEditorGrammarTool from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorMain/EssayEditorTools/EssayEditorGrammarTool';
import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiGetLatestSturcturedGptLog } from 'api/gpt';
import type { AssignmentProgress } from 'types/assignment';
import tuple from 'utils/types/tuple';

type Props = {
  tools: AssignmentProgress['stages'][number]['tools'];
};

const EssayEditorTools = ({ tools }: Props) => {
  const { essay } = useAssignmentEssayEditorProvider();

  const dictionaryTool = tools.find(tool => tool.key === 'dictionary');
  const grammarTool = tools.find(tool => tool.key === 'grammar');
  const autoGradeTool = tools.find(tool => tool.key === 'autograde');

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
      {!!dictionaryTool && (
        <EssayEditorDictionaryTool
          latestResult={getLatestResult(dictionaryTool.id)}
          toolId={dictionaryTool.id}
        />
      )}
      {!!grammarTool && (
        <EssayEditorGrammarTool
          essay={essay}
          latestResult={getLatestResult(grammarTool.id)}
          toolId={grammarTool.id}
        />
      )}
      {!!autoGradeTool && (
        <EssayEditorAutoGradeTool
          essay={essay}
          latestResult={getLatestResult(autoGradeTool.id)}
          toolId={autoGradeTool.id}
        />
      )}
    </div>
  );
};

export default EssayEditorTools;
