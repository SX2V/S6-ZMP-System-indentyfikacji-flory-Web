import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLang } from './useTranslation';

export const useIdleLogout = (timeoutMs: number = 15 * 60 * 1000) => {
    const navigate = useNavigate();
    const timerRef = useRef<number | null>(null);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');

        navigate('/login');

        const lang = getLang();
        const msg =
            lang === 'en'
                ? 'You have been logged out due to inactivity.'
                : 'Zostałeś wylogowany z powodu braku aktywności.';
        alert(msg);
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
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach((event) => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [resetTimer]);
};
