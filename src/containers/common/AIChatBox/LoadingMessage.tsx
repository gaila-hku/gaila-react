import React from 'react';

import { Bot } from 'lucide-react';

const LoadingMessage = () => {
  return (
    <div className="flex gap-2 justify-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="bg-muted rounded-lg px-3 py-2">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
