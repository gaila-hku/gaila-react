import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Info, List, Sparkles } from 'lucide-react';
import { useMutation } from 'react-query';

import Loading from 'components/display/Loading';
import Button from 'components/input/Button';

import AssignmentLanguageViewerVocabItem from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerVocabItem';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiGenerateVocab } from 'api/gpt';
import type {
  AssignmentLanguagePreparationContent,
  VocabSubmissionItem,
} from 'types/assignment';
import type { VocabGenerateResult } from 'types/gpt';

const AssignmentLanguageViewerVocab = () => {
  const { assignment, currentStage, saveSubmission } =
    useAssignmentSubmissionProvider();

  const vocabGenerateTool = currentStage?.tools.find(tool => {
    return tool.key === 'vocab_generate';
  });

  const [vocabList, setVocabList] = useState<VocabSubmissionItem[]>([]);

  const submissionContent = useMemo(() => {
    return currentStage?.submission?.content as
      | AssignmentLanguagePreparationContent
      | undefined;
  }, [currentStage?.submission?.content]);

  const init = useRef(false);
  useEffect(() => {
    if (init.current || !submissionContent) {
      return;
    }
    setVocabList(submissionContent.generated_vocabs);
    init.current = true;
  }, [submissionContent]);

  const saveNewVocabs = useCallback(
    (newVocabs: AssignmentLanguagePreparationContent['generated_vocabs']) => {
      if (!assignment || !currentStage) {
        return;
      }

      const allVocabs = [
        ...(submissionContent?.generated_vocabs || []),
        ...newVocabs,
      ];

      setVocabList(allVocabs);

      saveSubmission({
        assignment_id: assignment.id,
        stage_id: currentStage.id,
        content: { generated_vocabs: allVocabs },
        is_final: currentStage.submission?.is_final || false,
      });
    },
    [assignment, currentStage, saveSubmission, submissionContent],
  );

  const { mutateAsync: generateVocab, isLoading: isGeneratingVocab } =
    useMutation(apiGenerateVocab, {
      onSuccess(data) {
        try {
          const result = JSON.parse(data.gpt_answer) as VocabGenerateResult;
          const newVocabs = result.items.map((item, index) => ({
            id: `${data.id}-${index}`,
            text: item.text,
            type: item.type,
            will_be_used: false,
          }));
          setVocabList(newVocabs);
          saveNewVocabs(newVocabs);
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

  const handleToggleVocab = useCallback(
    (item: VocabSubmissionItem) => {
      if (!assignment || !currentStage) {
        return;
      }
      const newVocabs = vocabList.map(vocab => {
        if (vocab.id === item.id) {
          return { ...vocab, will_be_used: !vocab.will_be_used };
        }
        return vocab;
      });
      setVocabList(newVocabs);
      saveSubmission({
        assignment_id: assignment.id,
        stage_id: currentStage.id,
        content: { generated_vocabs: newVocabs },
        is_final: currentStage.submission?.is_final || false,
        refetchProgress: true,
      });
    },
    [assignment, currentStage, saveSubmission, vocabList],
  );

  if (!init.current) {
    return <Loading />;
  }

  return (
    <>
      {vocabList.length ? (
        <div className="h-[calc(100vh-350px)] pr-4 overflow-auto">
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-4 flex gap-3 items-start">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Use the check buttons to mark vocabulary you intend to use. This
              helps you stay focused on your language goals while drafting.
            </p>
          </div>
          <div className="space-y-3 mb-2">
            {vocabList.map((item, index) => (
              <AssignmentLanguageViewerVocabItem
                item={item}
                key={index}
                onToggleVocab={() => handleToggleVocab(item)}
              />
            ))}
          </div>
          <Button
            className="gap-2 ml-auto"
            disabled={isGeneratingVocab}
            onClick={handleGenerateVocab}
          >
            <Sparkles className="h-4 w-4" />
            {isGeneratingVocab
              ? 'Generating...'
              : vocabList.length
                ? 'Generate More'
                : 'Generate Vocabulary List'}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <List className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-2">
              Generate vocabulary list
            </p>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              AI will extract key vocabulary and phrases from the sample texts
            </p>
            <Button
              className="gap-2"
              disabled={isGeneratingVocab}
              onClick={handleGenerateVocab}
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingVocab ? 'Generating...' : 'Generate Vocabulary List'}
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default AssignmentLanguageViewerVocab;
