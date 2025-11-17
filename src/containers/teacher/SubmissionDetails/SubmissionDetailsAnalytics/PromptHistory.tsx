import React, { useMemo } from 'react';

import Badge from 'components/display/Badge';
import Table from 'components/display/Table';

const PromptHistory = () => {
  // Prompt category distribution
  const promptCategories = [
    {
      name: 'Performance-Oriented',
      value: 24,
      color: '#ef4444',
    },
    { name: 'Learning-Oriented', value: 38, color: '#22c55e' },
  ];

  // Prompt history
  const promptHistory = useMemo(
    () => [
      {
        id: 1,
        timestamp: 'Oct 12, 2025 3:45 PM',
        category: 'Learning-Oriented',
        prompt: 'Can you explain the greenhouse effect in simple terms?',
      },
      {
        id: 2,
        timestamp: 'Oct 12, 2025 3:30 PM',
        category: 'Performance-Oriented',
        prompt: 'Write a paragraph about ocean acidification',
      },
      {
        id: 3,
        timestamp: 'Oct 12, 2025 2:15 PM',
        category: 'Learning-Oriented',
        prompt: 'What are the main causes of climate change?',
      },
      {
        id: 4,
        timestamp: 'Oct 12, 2025 1:50 PM',
        category: 'Performance-Oriented',
        prompt: 'Give me a thesis statement for my essay',
      },
      {
        id: 5,
        timestamp: 'Oct 11, 2025 4:20 PM',
        category: 'Learning-Oriented',
        prompt: 'How do renewable energy sources work?',
      },
      {
        id: 6,
        timestamp: 'Oct 11, 2025 3:45 PM',
        category: 'Learning-Oriented',
        prompt: 'What is the Paris Climate Accord?',
      },
      {
        id: 7,
        timestamp: 'Oct 11, 2025 2:30 PM',
        category: 'Performance-Oriented',
        prompt: 'Suggest improvements to this paragraph',
      },
      {
        id: 8,
        timestamp: 'Oct 10, 2025 5:10 PM',
        category: 'Learning-Oriented',
        prompt: 'What are the effects of deforestation?',
      },
    ],
    [],
  );

  const totalPrompts = promptCategories.reduce(
    (sum, cat) => sum + cat.value,
    0,
  );

  const promptHistoryRows = useMemo(() => {
    return promptHistory.map(item => ({
      time: item.timestamp,
      category: (
        <Badge
          className="text-xs"
          variant={
            item.category === 'Learning-Oriented' ? 'primary' : 'secondary'
          }
        >
          {item.category === 'Learning-Oriented' ? 'Learning' : 'Performance'}
        </Badge>
      ),
      prompt: item.prompt,
    }));
  }, [promptHistory]);

  return (
    <>
      <div className="rounded-md border">
        <Table
          columns={[
            { key: 'time', title: 'Time' },
            { key: 'category', title: 'Category' },
            { key: 'prompt', title: 'Prompt' },
          ]}
          limit={10}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          page={1}
          rows={promptHistoryRows}
        />
      </div>
      <div className="pt-2 border-t">
        <p className="text-sm">
          <span className="text-muted-foreground">Showing:</span>{' '}
          <span className="font-medium">
            {promptHistory.length} of {totalPrompts} prompts
          </span>
        </p>
      </div>
    </>
  );
};

export default PromptHistory;
