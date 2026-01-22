import React, { useCallback } from 'react';

import Card from 'components/display/Card';
import Button from 'components/input/Button';

import useAIChatBox from 'containers/common/AIChatBox/AIChatBoxContext/useAIChatBox';

import type { VocabGenerateItem } from 'types/gpt';

type Props = { item: VocabGenerateItem };

const AssignmentLanguageViewerVocabItem = ({ item }: Props) => {
  const { sendMessage } = useAIChatBox();

  const handleVocabAction = useCallback(
    (word: string, action: 'definition' | 'example') => {
      const prompt =
        action === 'definition'
          ? `Provide a clear definition of "${word}".`
          : `Give me examples of how to use "${word}" in writing`;
      sendMessage(prompt);
    },
    [sendMessage],
  );

  return (
    <Card className="border-l-4 border-l-primary !py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{item.text}</p>
        <div className="flex gap-2">
          <Button
            className="text-xs"
            onClick={() => handleVocabAction(item.text, 'definition')}
            size="sm"
            variant="outline"
          >
            Definition
          </Button>
          <Button
            className="text-xs"
            onClick={() => handleVocabAction(item.text, 'example')}
            size="sm"
            variant="outline"
          >
            Example
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AssignmentLanguageViewerVocabItem;
