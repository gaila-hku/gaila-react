import React, { useCallback, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { isNumber } from 'lodash-es';
import { AlertTriangle, BarChart3, Bot, Clock } from 'lucide-react';
import { useMutation } from 'react-query';

import Card from 'components/display/Card';
import Divider from 'components/display/Divider';
import Button from 'components/input/Button';

import useAlert from 'containers/common/AlertProvider/useAlert';

import { apiSendReminder } from 'api/reminder';
import type { AssignmentSubmissionDetails } from 'types/assignment';
import { type StudentReminder, REMINDER_TYPES } from 'types/reminder';

type Props = {
  assignmentId: number;
  studentId: number;
  engagement: AssignmentSubmissionDetails['engagement'];
  lastReminders: AssignmentSubmissionDetails['last_reminders'];
  plagiarisedPercentage: number | null;
  lastSubmittedAt: number | null;
};

dayjs.extend(relativeTime);

const getReminderTypeLabel = (type: StudentReminder['reminder_type']) => {
  switch (type) {
    case 'writing':
      return (
        <>
          <Clock className="h-3 w-3" />
          <span className="text-xs">No writing for 3+ days</span>
        </>
      );
    case 'ai':
      return (
        <>
          <Bot className="h-3 w-3" />
          <span className="text-xs">No AI use for 3+ days</span>
        </>
      );
    case 'dashboard':
      return (
        <>
          <BarChart3 className="h-3 w-3" />
          <span className="text-xs">No dashboard view for 3+ days</span>
        </>
      );
    case 'copying':
      return (
        <>
          <AlertTriangle className="h-3 w-3 text-orange-500" />
          <span className="text-xs">High AI copying %</span>
        </>
      );
    default:
      return 'Unknown Reminder';
  }
};

const SubmissionDetailsReminder = ({
  assignmentId,
  studentId,
  engagement,
  lastReminders,
  plagiarisedPercentage,
  lastSubmittedAt,
}: Props) => {
  const { successMsg, errorMsg } = useAlert();

  const [apiLastSent, setApiLastSent] = useState<Record<string, number>>({});

  const lastRemindedAt = useMemo(
    () =>
      REMINDER_TYPES.reduce(
        (acc, type) => {
          acc[type] =
            apiLastSent[type] || lastReminders[type]?.reminded_at || null;
          return acc;
        },
        {} as Record<string, number | null>,
      ),
    [apiLastSent, lastReminders],
  );

  const { mutate: sendReminder, isLoading } = useMutation(apiSendReminder, {
    onSuccess: res => {
      setApiLastSent(prev => ({
        ...prev,
        [res.reminder_type]: res.reminded_at,
      }));
      successMsg(`Reminder sent successfully.`);
    },
    onError: (error: any) => {
      errorMsg('Error sending reminder:', error);
    },
  });

  const handleSendReminder = useCallback(
    (type: StudentReminder['reminder_type']) => {
      if (
        !!lastRemindedAt[type] &&
        dayjs().diff(dayjs(lastRemindedAt[type]), 'day') < 1
      ) {
        errorMsg('Reminder already sent within the last 24 hours.');
        return;
      }
      sendReminder({
        assignment_id: assignmentId,
        student_id: studentId,
        reminder_type: type,
      });
    },
    [assignmentId, errorMsg, lastRemindedAt, sendReminder, studentId],
  );

  return (
    <Card classes={{ children: 'space-y-3' }} title="Student Engagement">
      <div className="text-sm space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Writing:</span>
          <span className="font-medium">
            {dayjs().to(dayjs(lastSubmittedAt))}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last AI Use:</span>
          <span className="font-medium">
            {engagement.last_ai_use
              ? dayjs().to(dayjs(engagement.last_ai_use))
              : 'Never used'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Dashboard:</span>
          <span className="font-medium">
            {engagement.last_dashboard_use
              ? dayjs().to(dayjs(engagement.last_dashboard_use))
              : 'Never viewed'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">AI Copying:</span>
          <span className="font-medium text-orange-600">
            {isNumber(plagiarisedPercentage)
              ? `${plagiarisedPercentage}%`
              : 'N/A'}
          </span>
        </div>
      </div>

      <Divider />

      <div className="space-y-2 pt-2">
        <p className="text-xs text-muted-foreground mb-3">
          Send quick reminders:
        </p>

        {REMINDER_TYPES.map(type => (
          <Button
            className="w-full gap-2 justify-start"
            disabled={isLoading}
            key={type}
            onClick={() => handleSendReminder(type)}
            size="sm"
            variant="outline"
          >
            {getReminderTypeLabel(type)}
            {lastRemindedAt[type] && (
              <span className="ml-auto font-light text-muted-foreground">
                (Sent {dayjs().to(dayjs(lastRemindedAt[type]))})
              </span>
            )}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default SubmissionDetailsReminder;
