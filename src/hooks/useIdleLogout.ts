import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useIdleLogout = (timeoutMs: number = 15 * 60 * 1000) => {
    const navigate = useNavigate();
    const timerRef = useRef<number | null>(null);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('username');

        navigate('/login');

        alert("Zostałeś wylogowany z powodu braku aktywności.");
    }, [navigate]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
        }

        if (localStorage.getItem('token')) {
            timerRef.current = window.setTimeout(logout, timeoutMs);
        }
    }, [logout, timeoutMs]);

    useEffect(() => {
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart'
        ];

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer]);
};