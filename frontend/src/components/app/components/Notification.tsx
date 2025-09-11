import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import { useSocket } from '@/hooks/useSocket';
import AxiousInstance from '@/helper/AxiousInstance';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

interface NotificationProps {
  className?: string;
}

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  path: string;
  createdAt: string;
}

export default function Notification({ className = '' }: NotificationProps) {
  const { on, off, enableSound } = useSocket();
  const [notificationData, setNotificationData] = useState<NotificationItem[]>([]);
  const navigate = useNavigate();

  const getAllNotification = async () => {
    try {
      const response = await AxiousInstance.get('/notification');
      if (response.status === 200) {
        setNotificationData(response.data.notifications);
      }
    } catch (error: any) {
      console.error('Error ', error);
    }
  };

  useEffect(() => {
    getAllNotification();
  }, []);

  useEffect(() => {
    if (!on) return;

    const handleNotification = (newNotification: any) => {
      enableSound();
      setNotificationData((prev) => [...prev, newNotification]);
    };

    on('notification', handleNotification);

    return () => {
      off('notification', handleNotification);
    };
  }, [on, off, enableSound]);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.path) {
      navigate(notification.path);
    }
  };

  const handleClearNotification = async (id: string) => {
    try {
      setNotificationData((prev) => prev.filter((notif) => notif._id !== id));
      await AxiousInstance.delete(`/notification/${id}`);
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center justify-center rounded-md p-2 transition-all duration-200 hover:scale-110 ${className}`}
        >
          <Bell className={`h-6 w-6 ${notificationData.length > 0 ? 'animate-bell-shake' : ''}`} />
          {notificationData.length > 0 && (
            <span className="animate-badge-scale absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notificationData.length}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="scrollbar-hide mt-5.5 max-h-84 w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificationData.length > 0 ? (
          notificationData.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              className="hover:bg-accent relative flex cursor-pointer flex-col items-start p-3"
            >
              {/* Header Row: Title + Badge + X Icon */}
              <div className="flex w-full justify-between">
                <Badge variant="outline" className="rounded-sm text-xs capitalize">
                  {notification.type}
                </Badge>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive cursor-pointer rounded-md border p-1 hover:bg-amber-50 dark:hover:bg-amber-50/20"
                  data-disabled // prevents dropdown close
                  tabIndex={-1} // removes focusable behavior
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClearNotification(notification._id);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex w-full items-center justify-between">
                <div className="font-medium">{notification.title}</div>
              </div>

              <div className="w-full" onClick={() => handleNotificationClick(notification)}>
                <div className="text-muted-foreground mb-1 text-sm">{notification.body}</div>
                <div className="text-muted-foreground text-xs">
                  {moment(notification.createdAt).format('DD MMM YYYY, hh:mm A')}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
