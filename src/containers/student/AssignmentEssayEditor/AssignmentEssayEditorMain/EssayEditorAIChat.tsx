import React from 'react';

import { AlertCircle, Lightbulb, Sparkles, Target } from 'lucide-react';

import AIChatBox from 'containers/common/AIChatBox';
import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';

type Props = {
  toolId: number;
};

const EssayEditorAIChat = ({ toolId }: Props) => {
  return (
    <AIChatBoxProvider toolId={toolId}>
      <AIChatBox
        firstMessage="Hi! I'm your AI writing assistant. I can help you improve your essay, check grammar, generate ideas, or create an outline. What would you like help with?"
        suggestedPrompts={[
          {
            icon: Sparkles,
            text: 'Help me improve this sentence',
            category: 'improve',
          },
          {
            icon: Lightbulb,
            text: 'Give me ideas for my next paragraph',
            category: 'ideas',
          },
          {
            icon: Target,
            text: 'How can I strengthen my argument?',
            category: 'argument',
          },
          {
            icon: AlertCircle,
            text: 'What should I focus on to improve?',
            category: 'feedback',
          },
        ]}
      />
    </AIChatBoxProvider>
  );
};

export default EssayEditorAIChat;
