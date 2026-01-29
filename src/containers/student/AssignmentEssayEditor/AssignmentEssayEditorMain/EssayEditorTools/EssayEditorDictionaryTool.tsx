import React, { useCallback, useEffect, useState } from 'react';

import { Languages, Search } from 'lucide-react';
import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import AIChatBoxMini from 'containers/common/AIChatBox/AIChatBoxMini';

import { apiAskDictionaryAgent } from 'api/gpt';
import type { DictionaryResult, GptLog } from 'types/gpt';

type Props = {
  toolId: number;
  latestResult: GptLog | null;
};

const EssayEditorDictionaryTool = ({ toolId, latestResult }: Props) => {
  const { mutateAsync: askDictionaryAgent, isLoading: isAgentLoading } =
    useMutation(apiAskDictionaryAgent);

  const [dictionaryWord, setDictionaryWord] = useState('');

  // Dictionary state
  const [dictionaryResult, setDictionaryResult] =
    useState<DictionaryResult | null>(null);

  const handleDictionarySearch = useCallback(async () => {
    if (!dictionaryWord.trim()) return;

    const res = await askDictionaryAgent({
      question: dictionaryWord,
      assignment_tool_id: toolId,
      is_structured: true,
      essay: undefined,
    });
    const result = JSON.parse(res.gpt_answer) as DictionaryResult;
    setDictionaryResult(result);
  }, [askDictionaryAgent, dictionaryWord, toolId]);

  useEffect(() => {
    if (!latestResult) {
      setDictionaryResult(null);
      return;
    }
    const result = JSON.parse(latestResult.gpt_answer) as DictionaryResult;
    setDictionaryResult(result);
  }, [latestResult]);

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2 text-base',
        children: 'space-y-3',
        root: '!p-4',
      }}
      collapsible
      defaultCollapsed
      title={
        <>
          <Languages className="h-4 w-4" />
          Dictionary
        </>
      }
    >
      <div className="space-y-2">
        <TextInput
          className="text-sm"
          onChange={e => setDictionaryWord(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleDictionarySearch();
            }
          }}
          placeholder="Enter a word..."
          value={dictionaryWord}
        />
      </div>
      <Button
        className="w-full gap-2"
        disabled={isAgentLoading}
        onClick={handleDictionarySearch}
        size="sm"
      >
        <Search className="h-4 w-4" />
        {isAgentLoading ? 'Searching...' : 'Search'}
      </Button>

      {dictionaryResult && (
        <div className="space-y-2 p-3 bg-secondary rounded-lg text-xs">
          <div>
            <h4 className="font-semibold">
              {dictionaryResult.original_word}{' '}
              <span className="text-muted-foreground italic">
                ({dictionaryResult.parts_of_speech})
              </span>
            </h4>
          </div>
          <div>
            <p className="font-medium">Translation: </p>
            <p className="text-muted-foreground">
              {dictionaryResult.translation}
            </p>
          </div>
          <div>
            <p className="font-medium">Definition:</p>
            <p className="text-muted-foreground">
              {dictionaryResult.definition}
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Examples:</p>
            <ul className="space-y-1">
              {dictionaryResult.examples.map((example, idx) => (
                <li
                  className="text-muted-foreground pl-2 border-l-2 border-primary"
                  key={idx}
                >
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Dictionary Agent Chat */}
      {dictionaryResult && (
        <AIChatBoxProvider chatMutateFn={askDictionaryAgent} toolId={toolId}>
          <AIChatBoxMini
            chatName="Ask Dictionary Agent"
            firstMessage={`Ask me about synonyms, usage examples, formality, or anything related to "${dictionaryResult.original_word}"!`}
          />
        </AIChatBoxProvider>
      )}
    </Card>
  );
};

export default EssayEditorDictionaryTool;
