import React, { useCallback } from 'react';

import clsx from 'clsx';

import Card from 'components/display/Card';
import Button from 'components/input/Button';
import CheckboxInput from 'components/input/CheckboxInput';

import useAIChatBox from 'containers/common/AIChatBox/AIChatBoxContext/useAIChatBox';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import type { VocabSubmissionItem } from 'types/assignment';

type Props = {
  item: VocabSubmissionItem;
  onToggleVocab: () => void;
  setCurrentSidebarTab: (tab: string) => void;
};

const AssignmentLanguageViewerVocabItem = ({
  item,
  onToggleVocab,
  setCurrentSidebarTab,
}: Props) => {
  const { sendMessage, isAgentTyping } = useAIChatBox();
  const { currentStage } = useAssignmentSubmissionProvider();

  const generalChatTool = currentStage?.tools.find(tool => {
    return tool.key === 'language_general' && tool.enabled;
  });

  const handleVocabAction = useCallback(
    (word: string, action: 'definition' | 'example') => {
      const prompt =
        action === 'definition'
          ? `Provide a clear definition of "${word}".`
          : `Give me examples of how to use "${word}" in writing`;
      setCurrentSidebarTab('general_chat');
      sendMessage(prompt);
    },
    [sendMessage, setCurrentSidebarTab],
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
        {!!generalChatTool && (
          <div className="flex gap-2">
            <Button
              className="text-xs"
              disabled={isAgentTyping}
              onClick={() => handleVocabAction(item.text, 'definition')}
              size="sm"
              variant="outline"
            >
              Definition
            </Button>
            <Button
              className="text-xs"
              disabled={isAgentTyping}
              onClick={() => handleVocabAction(item.text, 'example')}
              size="sm"
              variant="outline"
            >
              Example
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AssignmentLanguageViewerVocabItem;
