import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationResponse } from '../types/auth';

vi.mock('../api/notifications', () => ({
    notificationsApi: {
        getNotifications: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        deleteNotification: vi.fn(),
    },
}));

import { notificationsApi } from '../api/notifications';

const makeNotification = (overrides: Partial<NotificationResponse> = {}): NotificationResponse => ({
    id: '1',
    title: 'Test',
    message: 'Treść powiadomienia',
    read: false,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
});

describe('useNotifications', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.setItem('token', 'test-token');
        vi.clearAllMocks();
        (notificationsApi.getNotifications as any).mockResolvedValue({ data: [] });
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    it('odpala polling co 30 sekund', async () => {
        renderHook(() => useNotifications());

        await act(async () => {
            await Promise.resolve();
        });
        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(1);

        await act(async () => {
            vi.advanceTimersByTime(30_000);
            await Promise.resolve();
        });
        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(2);

        await act(async () => {
            vi.advanceTimersByTime(30_000);
            await Promise.resolve();
        });
        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(3);
    });

    it('zatrzymuje polling po odmontowaniu', async () => {
        const { unmount } = renderHook(() => useNotifications());

        await act(async () => {
            await Promise.resolve();
        });
        const callsAfterMount = (notificationsApi.getNotifications as any).mock.calls.length;

        unmount();

        await act(async () => {
            vi.advanceTimersByTime(30_000);
            await Promise.resolve();
        });
        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(callsAfterMount);
    });

    it('nie fetchuje gdy brak tokenu', async () => {
        localStorage.removeItem('token');
        renderHook(() => useNotifications());

        await act(async () => {
            await Promise.resolve();
        });
        expect(notificationsApi.getNotifications).not.toHaveBeenCalled();
    });

    it('markRead aktualizuje stan lokalnie bez dodatkowego fetcha', async () => {
        const n1 = makeNotification({ id: '1', read: false });
        const n2 = makeNotification({ id: '2', read: false });
        (notificationsApi.getNotifications as any).mockResolvedValueOnce({ data: [n1, n2] });
        (notificationsApi.markAsRead as any).mockResolvedValueOnce({});

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        const callsBefore = (notificationsApi.getNotifications as any).mock.calls.length;

        await act(async () => {
            await result.current.markRead('1');
        });

        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(callsBefore);
        expect(notificationsApi.markAsRead).toHaveBeenCalledWith('1');

        const updated = result.current.notifications.find((n) => n.id === '1');
        expect(updated?.read).toBe(true);
        expect(result.current.notifications.find((n) => n.id === '2')?.read).toBe(false);
    });

    it('markAllRead oznacza wszystkie jako przeczytane bez dodatkowego fetcha', async () => {
        const notifications = [
            makeNotification({ id: '1', read: false }),
            makeNotification({ id: '2', read: false }),
            makeNotification({ id: '3', read: true }),
        ];
        (notificationsApi.getNotifications as any).mockResolvedValueOnce({ data: notifications });
        (notificationsApi.markAllAsRead as any).mockResolvedValueOnce({});

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        const callsBefore = (notificationsApi.getNotifications as any).mock.calls.length;

        await act(async () => {
            await result.current.markAllRead();
        });

        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(callsBefore);
        expect(result.current.notifications.every((n) => n.read)).toBe(true);
        expect(result.current.unreadCount).toBe(0);
    });

    it('remove usuwa powiadomienie z listy bez fetcha', async () => {
        const notifications = [makeNotification({ id: '1' }), makeNotification({ id: '2' })];
        (notificationsApi.getNotifications as any).mockResolvedValueOnce({ data: notifications });
        (notificationsApi.deleteNotification as any).mockResolvedValueOnce({});

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        const callsBefore = (notificationsApi.getNotifications as any).mock.calls.length;

        await act(async () => {
            await result.current.remove('1');
        });

        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(callsBefore);
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].id).toBe('2');
    });

    it('unreadCount zwraca poprawną liczbę nieprzeczytanych', async () => {
        const notifications = [
            makeNotification({ id: '1', read: false }),
            makeNotification({ id: '2', read: true }),
            makeNotification({ id: '3', read: false }),
        ];
        (notificationsApi.getNotifications as any).mockResolvedValueOnce({ data: notifications });

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.unreadCount).toBe(2);
    });

    it('ignoruje błąd fetcha i nie crashuje', async () => {
        (notificationsApi.getNotifications as any).mockRejectedValueOnce(
            new Error('Network error')
        );

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.notifications).toHaveLength(0);
    });

    it('polling odpala się dokładnie co 30s — nie częściej', async () => {
        renderHook(() => useNotifications());

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            vi.advanceTimersByTime(29_999);
            await Promise.resolve();
        });
        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(1);

        await act(async () => {
            vi.advanceTimersByTime(1);
            await Promise.resolve();
        });
        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(2);
    });

    it('polling nie odpala się gdy brak tokenu (token usunięty po montowaniu)', async () => {
        renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        localStorage.removeItem('token');

        await act(async () => {
            vi.advanceTimersByTime(30_000);
            await Promise.resolve();
        });

        expect(notificationsApi.getNotifications).toHaveBeenCalledTimes(1);
    });

    it('markRead nie zmienia innych powiadomień', async () => {
        const notifications = [
            makeNotification({ id: '1', read: false }),
            makeNotification({ id: '2', read: false }),
            makeNotification({ id: '3', read: true }),
        ];
        (notificationsApi.getNotifications as any).mockResolvedValueOnce({ data: notifications });
        (notificationsApi.markAsRead as any).mockResolvedValueOnce({});

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            await result.current.markRead('2');
        });

        expect(result.current.notifications.find((n) => n.id === '1')?.read).toBe(false);
        expect(result.current.notifications.find((n) => n.id === '2')?.read).toBe(true);
        expect(result.current.notifications.find((n) => n.id === '3')?.read).toBe(true);
    });

    it('remove usuwa właściwe powiadomienie gdy lista ma wiele elementów', async () => {
        const notifications = [
            makeNotification({ id: '1' }),
            makeNotification({ id: '2' }),
            makeNotification({ id: '3' }),
        ];
        (notificationsApi.getNotifications as any).mockResolvedValueOnce({ data: notifications });
        (notificationsApi.deleteNotification as any).mockResolvedValueOnce({});

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            await result.current.remove('2');
        });

        expect(result.current.notifications).toHaveLength(2);
        expect(result.current.notifications.map((n) => n.id)).toEqual(['1', '3']);
    });

    it('unreadCount jest 0 gdy brak powiadomień', async () => {
        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.unreadCount).toBe(0);
    });

    it('unreadCount aktualizuje się po markRead', async () => {
        const notifications = [
            makeNotification({ id: '1', read: false }),
            makeNotification({ id: '2', read: false }),
        ];
        (notificationsApi.getNotifications as any).mockResolvedValueOnce({ data: notifications });
        (notificationsApi.markAsRead as any).mockResolvedValue({});

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.unreadCount).toBe(2);

        await act(async () => {
            await result.current.markRead('1');
        });
        expect(result.current.unreadCount).toBe(1);

        await act(async () => {
            await result.current.markRead('2');
        });
        expect(result.current.unreadCount).toBe(0);
    });

    it('refetch pobiera świeże dane z API', async () => {
        const first = [makeNotification({ id: '1', read: false })];
        const second = [
            makeNotification({ id: '1', read: true }),
            makeNotification({ id: '2', read: false }),
        ];
        (notificationsApi.getNotifications as any)
            .mockResolvedValueOnce({ data: first })
            .mockResolvedValueOnce({ data: second });

        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.notifications).toHaveLength(1);

        await act(async () => {
            await result.current.refetch();
        });

        expect(result.current.notifications).toHaveLength(2);
        expect(result.current.unreadCount).toBe(1);
    });

    it('open / setOpen przełącza stan panelu powiadomień', async () => {
        const { result } = renderHook(() => useNotifications());
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.open).toBe(false);

        act(() => {
            result.current.setOpen(true);
        });
        expect(result.current.open).toBe(true);

        act(() => {
            result.current.setOpen(false);
        });
        expect(result.current.open).toBe(false);
    });
});
