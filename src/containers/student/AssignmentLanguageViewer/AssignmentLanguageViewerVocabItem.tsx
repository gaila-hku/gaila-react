import React, { useCallback } from 'react';

import clsx from 'clsx';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import CheckboxInput from 'components/input/CheckboxInput';

import useAIChatBox from 'containers/common/AIChatBox/AIChatBoxContext/useAIChatBox';

import type { VocabSubmissionItem } from 'types/assignment';

type Props = {
  item: VocabSubmissionItem;
  onToggleVocab: () => void;
};

const AssignmentLanguageViewerVocabItem = ({ item, onToggleVocab }: Props) => {
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
    <Card
      className={clsx(
        '!py-2 border-l-4 transition-all',
        item.will_be_used ? 'border-l-primary' : 'border-l-muted',
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <CheckboxInput
            defaultValue={item.will_be_used ? [item.id] : []}
            onChange={() => onToggleVocab()}
            options={[{ key: item.id, label: '' }]}
          />
          <p className="font-medium">{item.text}</p>
        </div>
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
