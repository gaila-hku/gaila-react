import React, { useState } from 'react';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const UseTimeCharts = () => {
  const [usageData] = useState({
    writing: 245,
    dictionary: 45,
    checklist: 32,
    chatgpt: 128,
  });

  const usageChartData = [
    {
      name: 'Writing',
      value: usageData.writing,
      color: '#8b5cf6',
    },
    {
      name: 'Dictionary',
      value: usageData.dictionary,
      color: '#3b82f6',
    },
    {
      name: 'Checklist',
      value: usageData.checklist,
      color: '#10b981',
    },
    {
      name: 'ChatGPT',
      value: usageData.chatgpt,
      color: '#f59e0b',
    },
  ];

  return (
    <>
      <div className="h-[300px]">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={usageChartData}
              dataKey="value"
              fill="#8884d8"
              label={({ name, percent }) =>
                `${name}: ${((percent || 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              outerRadius={100}
            >
              {usageChartData.map((entry, index) => (
                <Cell fill={entry.color} key={`cell-${index}`} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        {usageChartData.map(item => (
          <div className="flex items-center gap-2 text-sm" key={item.name}>
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span className="text-muted-foreground">{item.name}:</span>
            <span>{item.value} min</span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t">
        <p className="text-sm">
          <span className="text-muted-foreground">Total Time:</span>{' '}
          <span className="font-medium">
            {usageChartData.reduce((sum, item) => sum + item.value, 0)} minutes
          </span>
        </p>
      </div>
    </>
  );
};

export default UseTimeCharts;
