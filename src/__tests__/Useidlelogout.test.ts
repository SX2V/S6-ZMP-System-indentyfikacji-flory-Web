import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdleLogout } from '../hooks/useIdleLogout';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('../hooks/useTranslation', () => ({
    getLang: () => 'pl',
}));

vi.stubGlobal('alert', vi.fn());

const TIMEOUT = 1000;

describe('useIdleLogout', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('refreshToken', 'refresh-token');
        localStorage.setItem('username', 'jan');
        localStorage.setItem('userId', '1');
        localStorage.setItem('isAdmin', 'false');
        mockNavigate.mockClear();
        vi.mocked(alert).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    it('czyści localStorage i przekierowuje po upłynięciu timeoutu', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        act(() => {
            vi.advanceTimersByTime(TIMEOUT);
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(localStorage.getItem('username')).toBeNull();
        expect(localStorage.getItem('userId')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('resetuje timer przy aktywności użytkownika (mousemove)', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        act(() => {
            vi.advanceTimersByTime(800);
        });
        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => {
            window.dispatchEvent(new Event('mousemove'));
        });

        act(() => {
            vi.advanceTimersByTime(800);
        });
        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('resetuje timer przy każdym zdarzeniu aktywności', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
        events.forEach((event) => {
            act(() => {
                vi.advanceTimersByTime(900);
            });
            act(() => {
                window.dispatchEvent(new Event(event));
            });
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('nie uruchamia timera gdy nie ma tokenu w localStorage', () => {
        localStorage.removeItem('token');
        renderHook(() => useIdleLogout(TIMEOUT));

        act(() => {
            vi.advanceTimersByTime(TIMEOUT + 100);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('czyści timer przy odmontowaniu komponentu', () => {
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
        const { unmount } = renderHook(() => useIdleLogout(TIMEOUT));

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });

    it('wyświetla komunikat po polsku gdy lang === pl', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        act(() => {
            vi.advanceTimersByTime(TIMEOUT);
        });

        expect(vi.mocked(alert)).toHaveBeenCalledWith(
            'Zostałeś wylogowany z powodu braku aktywności.'
        );
    });

    it('resetuje timer wielokrotnie — każda aktywność odsuwa logout', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        for (let i = 0; i < 3; i++) {
            act(() => {
                vi.advanceTimersByTime(700);
            });
            act(() => {
                window.dispatchEvent(new Event('mousemove'));
            });
            expect(mockNavigate).not.toHaveBeenCalled();
        }

        act(() => {
            vi.advanceTimersByTime(TIMEOUT);
        });
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('logout jest wywoływany dokładnie raz, nie wielokrotnie', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        act(() => {
            vi.advanceTimersByTime(TIMEOUT);
        });
        act(() => {
            vi.advanceTimersByTime(TIMEOUT * 3);
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('usuwa nasłuchiwacze zdarzeń przy odmontowaniu', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
        const { unmount } = renderHook(() => useIdleLogout(TIMEOUT));

        unmount();

        const expectedEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        expectedEvents.forEach((event) => {
            expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
        });
        removeEventListenerSpy.mockRestore();
    });

    it('po odmontowaniu i ponownym zamontowaniu timer działa od nowa', () => {
        const { unmount } = renderHook(() => useIdleLogout(TIMEOUT));
        act(() => {
            vi.advanceTimersByTime(500);
        });
        unmount();

        act(() => {
            vi.advanceTimersByTime(TIMEOUT);
        });
        expect(mockNavigate).not.toHaveBeenCalled();

        renderHook(() => useIdleLogout(TIMEOUT));
        act(() => {
            vi.advanceTimersByTime(TIMEOUT);
        });
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('czyści isAdmin z localStorage przy wylogowaniu', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        act(() => {
            vi.advanceTimersByTime(TIMEOUT);
        });

        expect(localStorage.getItem('isAdmin')).toBeNull();
    });

    it('gdy token znika w trakcie odliczania — kolejna aktywność nie wznawia timera', () => {
        renderHook(() => useIdleLogout(TIMEOUT));

        act(() => {
            vi.advanceTimersByTime(500);
        });

        localStorage.removeItem('token');

        act(() => {
            window.dispatchEvent(new Event('mousemove'));
        });
        act(() => {
            vi.advanceTimersByTime(TIMEOUT + 100);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
