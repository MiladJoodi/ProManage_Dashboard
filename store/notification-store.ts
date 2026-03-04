import { create } from 'zustand';
import { Notification } from '@/lib/types';
import { notifications as initialNotifications } from '@/lib/data';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const computeUnreadCount = (notifications: Notification[]): number =>
  notifications.filter(n => !n.read).length;

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [...initialNotifications],
  unreadCount: computeUnreadCount(initialNotifications),

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...get().notifications];
    set({
      notifications: updatedNotifications,
      unreadCount: computeUnreadCount(updatedNotifications),
    });
  },

  markAsRead: (id) => {
    const updatedNotifications = get().notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    set({
      notifications: updatedNotifications,
      unreadCount: computeUnreadCount(updatedNotifications),
    });
  },

  markAllAsRead: () => {
    const updatedNotifications = get().notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });
  },

  deleteNotification: (id) => {
    const updatedNotifications = get().notifications.filter(
      notification => notification.id !== id
    );
    set({
      notifications: updatedNotifications,
      unreadCount: computeUnreadCount(updatedNotifications),
    });
  },
}));
