import React from 'react';

import { AlertTriangle, BarChart3, Bot, Clock } from 'lucide-react';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Button from 'components/input/Button';

import useAlert from 'containers/common/AlertProvider/useAlert';

const SubmissionDetailsReminder = () => {
  const { successMsg } = useAlert();

  const student = {
    name: 'Emma Thompson',
    email: 'emma.t@school.edu',
    lastWriting: '4 days ago',
    lastAIUse: '4 days ago',
    lastDashboardView: '5 days ago',
    aiCopyingPercentage: 42,
  };

  const handleSendReminder = (type: string) => {
    let message = '';
    switch (type) {
      case 'no-writing':
        message = `Reminder sent to ${student.name} about writing inactivity (${student.lastWriting})`;
        break;
      case 'no-ai':
        message = `Reminder sent to ${student.name} about AI tool usage (${student.lastAIUse})`;
        break;
      case 'high-ai':
        message = `Reminder sent to ${student.name} about high AI copying percentage (${student.aiCopyingPercentage}%)`;
        break;
      case 'no-dashboard':
        message = `Reminder sent to ${student.name} about dashboard inactivity (${student.lastDashboardView})`;
        break;
    }
    successMsg(message);
  };
  return (
    <Card classes={{ children: 'space-y-3' }} title="Student Engagement">
      <div className="text-sm space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Writing:</span>
          <span className="font-medium">{student.lastWriting}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last AI Use:</span>
          <span className="font-medium">{student.lastAIUse}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Dashboard:</span>
          <span className="font-medium">{student.lastDashboardView}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">AI Copying:</span>
          <span className="font-medium text-orange-600">
            {student.aiCopyingPercentage}%
          </span>
        </div>
      </div>

      <Divider />

      <div className="space-y-2 pt-2">
        <p className="text-xs text-muted-foreground mb-3">
          Send quick reminders:
        </p>

        <Button
          className="w-full gap-2 justify-start"
          onClick={() => handleSendReminder('no-writing')}
          size="sm"
          variant="outline"
        >
          <Clock className="h-3 w-3" />
          <span className="text-xs">No writing for 3+ days</span>
        </Button>

        <Button
          className="w-full gap-2 justify-start"
          onClick={() => handleSendReminder('no-ai')}
          size="sm"
          variant="outline"
        >
          <Bot className="h-3 w-3" />
          <span className="text-xs">No AI use for 3+ days</span>
        </Button>

        <Button
          className="w-full gap-2 justify-start"
          onClick={() => handleSendReminder('high-ai')}
          size="sm"
          variant="outline"
        >
          <AlertTriangle className="h-3 w-3 text-orange-500" />
          <span className="text-xs">High AI copying %</span>
        </Button>

        <Button
          className="w-full gap-2 justify-start"
          onClick={() => handleSendReminder('no-dashboard')}
          size="sm"
          variant="outline"
        >
          <BarChart3 className="h-3 w-3" />
          <span className="text-xs">No dashboard view for 3+ days</span>
        </Button>
      </div>
    </Card>
  );
};

export default SubmissionDetailsReminder;
