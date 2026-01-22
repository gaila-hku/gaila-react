import React, { useCallback, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { List, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from 'react-query';

import Loading from 'components/display/Loading';
import Button from 'components/input/Button';

import AssignmentLanguageViewerVocabItem from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerVocabItem';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGenerateVocab, apiGetLatestSturcturedGptLog } from 'api/gpt';
import type { VocabGenerateItem, VocabGenerateResult } from 'types/gpt';
import tuple from 'utils/types/tuple';

const AssignmentLanguageViewerVocab = () => {
  const { currentStage } = useAssignmentSubmissionProvider();

  const vocabGenerateTool = currentStage?.tools.find(tool => {
    return tool.key === 'vocab_generate';
  });

  const [vocabList, setVocabList] = useState<VocabGenerateItem[]>([]);
  const init = useRef(false);

  const { data, isLoading } = useQuery(
    tuple([
      apiGetLatestSturcturedGptLog.queryKey,
      { assignment_tool_ids: [vocabGenerateTool?.id || -1] },
    ]),
    apiGetLatestSturcturedGptLog,
    { enabled: !!vocabGenerateTool },
  );

  useEffect(() => {
    if (data?.[0]) {
      try {
        const result = JSON.parse(data[0].gpt_answer) as VocabGenerateResult;
        setVocabList(result.items);
      } catch (e) {
        console.error('Failed to parse vocab generate result', e);
      }
    }
    init.current = true;
  }, [data]);

  const { mutateAsync: generateVocab, isLoading: isGeneratingVocab } =
    useMutation(apiGenerateVocab, {
      onSuccess(data) {
        try {
          setVocabList(
            (JSON.parse(data.gpt_answer) as VocabGenerateResult).items,
          );
        } catch (e) {
          console.error('Failed to parse vocab generate result', e);
        }
      },
    });

  const handleGenerateVocab = useCallback(() => {
    if (!vocabGenerateTool) {
      return;
    }
    generateVocab({ assignment_tool_id: vocabGenerateTool.id });
  }, [generateVocab, vocabGenerateTool]);

  if (isLoading || !init.current) {
    return <Loading />;
  }

  return (
    <>
      <div
        className={clsx(
          vocabList.length
            ? 'pt-2 pb-4'
            : 'flex flex-col items-center justify-center py-12 text-center',
        )}
      >
        {!vocabList.length && (
          <>
            <List className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-2">
              Generate vocabulary list
            </p>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              AI will extract key vocabulary and phrases from the sample texts
            </p>
          </>
        )}
        <Button
          className="gap-2"
          disabled={isGeneratingVocab}
          onClick={handleGenerateVocab}
        >
          <Sparkles className="h-4 w-4" />
          {isGeneratingVocab
            ? 'Generating...'
            : `${vocabList.length ? 'Regenerate' : 'Generate'} Vocabulary List`}
        </Button>
      </div>
      {!!vocabList.length && (
        <div className="h-[calc(100vh-350px)] pr-4 overflow-auto">
          <div className="space-y-3">
            {vocabList.map((item, index) => (
              <AssignmentLanguageViewerVocabItem item={item} key={index} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AssignmentLanguageViewerVocab;
