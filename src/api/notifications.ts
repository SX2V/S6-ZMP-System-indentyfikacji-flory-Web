import api from './axiosConfig';
import type { NotificationResponse } from '../types/auth';

export const notificationsApi = {
    getNotifications: () => api.get<NotificationResponse[]>('/notifications'),

    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

    markAllAsRead: () => api.patch('/notifications/read-all'),

    deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};
