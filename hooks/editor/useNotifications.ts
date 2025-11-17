import { useState, useCallback } from 'react';
import { generateId } from '../../lib/utils';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

/**
 * Manages a queue of notifications for displaying app-wide messages.
 * This would typically be used with a NotificationProvider and a Toast component.
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info', duration = 3000) => {
    const id = generateId();
    const newNotification: Notification = { id, message, type, duration };
    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};
