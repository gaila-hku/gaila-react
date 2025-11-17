import React from 'react';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const PromptCategoryCharts = () => {
  // Prompt category distribution
  const promptCategories = [
    {
      name: 'Performance-Oriented',
      value: 24,
      color: '#ef4444',
    },
    { name: 'Learning-Oriented', value: 38, color: '#22c55e' },
  ];

  const totalPrompts = promptCategories.reduce(
    (sum, cat) => sum + cat.value,
    0,
  );

  return (
    <>
      <div className="h-[300px]">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={promptCategories}
              dataKey="value"
              fill="#8884d8"
              label={({ name, percent }) =>
                `${name}: ${((percent || 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              outerRadius={80}
            >
              {promptCategories.map((entry, index) => (
                <Cell fill={entry.color} key={`cell-${index}`} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 pt-2">
        {promptCategories.map(item => (
          <div className="flex items-center justify-between" key={item.name}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm">{item.value} prompts</span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t">
        <p className="text-sm">
          <span className="text-muted-foreground">Total Prompts:</span>{' '}
          <span className="font-medium">{totalPrompts} prompts</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Performance-oriented prompts focus on getting answers, while
          learning-oriented prompts focus on understanding concepts.
        </p>
      </div>
    </>
  );
};

export default PromptCategoryCharts;
