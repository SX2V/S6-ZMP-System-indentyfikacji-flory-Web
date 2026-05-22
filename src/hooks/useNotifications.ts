import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationsApi } from '../api/notifications';
import type { NotificationResponse } from '../types/auth';

const POLL_INTERVAL = 30_000;

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [open, setOpen] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const isLoggedIn = () => !!localStorage.getItem('token');

    const fetch = useCallback(async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await notificationsApi.getNotifications();
            setNotifications(res.data);
        } catch {
            /* silent */
        }
    }, []);

    useEffect(() => {
        fetch();
        intervalRef.current = window.setInterval(fetch, POLL_INTERVAL);
        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [fetch]);

    const markRead = async (id: string) => {
        await notificationsApi.markAsRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllRead = async () => {
        await notificationsApi.markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const remove = async (id: string) => {
        await notificationsApi.deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        open,
        setOpen,
        markRead,
        markAllRead,
        remove,
        unreadCount,
        refetch: fetch,
    };
};
