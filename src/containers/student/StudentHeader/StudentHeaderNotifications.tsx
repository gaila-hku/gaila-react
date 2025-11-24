import React, { useCallback, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import dayjs from 'dayjs';
import { Bell, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Divider from 'components/display/Divider';
import InfiniteList from 'components/display/InfiniteList';
import DropdownMenu from 'components/navigation/DropdownMenu';

import { apiGetReminders } from 'api/reminder';
import type { ReminderListingResponse, StudentReminder } from 'types/reminder';
import usePersistState from 'utils/service/usePersistState';
import tuple from 'utils/types/tuple';

const getReminderMessage = (type: StudentReminder['reminder_type']) => {
  switch (type) {
    case 'writing':
      return 'You have not submitted any drafts for 3+ days. Keep up the momentum!';
    case 'ai':
      return 'You have not been using AI tools recently. Remember to leverage them for better writing!';
    case 'dashboard':
      return 'You have not been checking your dashboard recently. Stay updated with your assignments!';
    case 'copying':
      return 'You have been relying too much on copying AI. Focus on developing your own writing skills!';
  }
};

const StudentHeaderNotifications = () => {
  const navigate = useNavigate();

  // TODO: add student ID to persist state key
  const [readNotifications, setReadNotifications] = usePersistState<number[]>(
    'student-read-notifications',
    [],
  );
  const [hasUnread, setHasUnread] = useState(false);

  const onClickNotification = useCallback(
    (reminder: StudentReminder) => {
      setReadNotifications([...readNotifications, reminder.id]);
      navigate(
        pathnames.assignmentEditSubmission(String(reminder.assignment_id)),
      );
    },
    [navigate, readNotifications, setReadNotifications],
  );

  const onFetchRemindersSuccess = useCallback(
    (data: ReminderListingResponse) => {
      const reminders = data.value;
      if (reminders.length === 0) {
        return;
      }
      const unread = reminders.some(
        reminder => !readNotifications.includes(reminder.id),
      );
      setHasUnread(hasUnread || unread);
    },
    [hasUnread, readNotifications],
  );

  const renderNotification = useCallback(
    (reminder: StudentReminder) => {
      return (
        <MenuItem
          key={reminder.id}
          onClick={() => onClickNotification(reminder)}
        >
          <div className="flex gap-2 items-center">
            <span className="relative">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              {!readNotifications.includes(reminder.id) && (
                <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500" />
              )}
            </span>
            <div className="flex-1 leading-0.5">
              <span className="whitespace-normal text-sm">
                You have a reminder from your teacher:{' '}
                {getReminderMessage(reminder.reminder_type)}
              </span>
              <span className="block text-xs text-muted-foreground">
                {dayjs(reminder.reminded_at).format('MMM D, YYYY h:mm A')}
              </span>
            </div>
          </div>
        </MenuItem>
      );
    },
    [onClickNotification, readNotifications],
  );

  return (
    <DropdownMenu
      keepMounted
      menuChildren={[
        <div className="px-4" key="title">
          Notifications
        </div>,
        <Divider key="divider" />,
        <InfiniteList
          initPageLimit={5}
          key="infinite-list"
          queryFn={apiGetReminders}
          queryKey={tuple([apiGetReminders.queryKey, { page: 1, limit: 10 }])}
          queryOption={{ onSuccess: onFetchRemindersSuccess }}
          renderItem={renderNotification}
        />,
      ]}
      sx={{ '& .MuiPaper-root': { width: 400 } }}
    >
      <Bell className="h-4 w-4" />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500" />
      )}
    </DropdownMenu>
  );
};

export default StudentHeaderNotifications;
