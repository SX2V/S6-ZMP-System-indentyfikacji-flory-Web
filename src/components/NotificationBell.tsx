import React, { useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from '../hooks/useTranslation';

export const NotificationBell = () => {
    const { notifications, open, setOpen, markRead, markAllRead, remove, unreadCount } =
        useNotifications();
    const { t } = useTranslation();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, setOpen]);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
        if (diffMin < 1) return t('notifJustNow');
        if (diffMin < 60) return `${diffMin} ${t('notifMinutesAgo')}`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH} ${t('notifHoursAgo')}`;
        return d.toLocaleDateString();
    };

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label={t('notifications')}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 22,
                    lineHeight: 1,
                    padding: '4px 6px',
                    borderRadius: 6,
                    color: 'var(--moss)',
                    transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dew)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
                🔔
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            background: '#e53935',
                            color: '#fff',
                            borderRadius: '50%',
                            fontSize: 10,
                            fontWeight: 700,
                            minWidth: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 3px',
                            lineHeight: 1,
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: 320,
                        maxWidth: 'calc(100vw - 32px)',
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 4px 24px rgba(45,74,45,0.18)',
                        border: '1px solid #dde8db',
                        zIndex: 200,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderBottom: '1px solid #f0f0f0',
                        }}
                    >
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--moss)' }}>
                            {t('notifications')}
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    color: 'var(--fern)',
                                    padding: '2px 4px',
                                }}
                            >
                                {t('notifMarkAllRead')}
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div
                                style={{
                                    padding: '32px 16px',
                                    textAlign: 'center',
                                    color: '#aaa',
                                    fontSize: 13,
                                }}
                            >
                                {t('notifEmpty')}
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.read && markRead(n.id)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f5f5f5',
                                        background: n.read ? '#fff' : '#f0f7f0',
                                        cursor: n.read ? 'default' : 'pointer',
                                        transition: 'background 0.15s',
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: n.read ? 400 : 600,
                                                fontSize: 13,
                                                color: 'var(--soil)',
                                                marginBottom: 2,
                                            }}
                                        >
                                            {n.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                                marginBottom: 4,
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {n.message}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#aaa' }}>
                                            {formatTime(n.createdAt)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            remove(n.id);
                                        }}
                                        title={t('notifDelete')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#ccc',
                                            fontSize: 16,
                                            padding: '0 2px',
                                            flexShrink: 0,
                                            lineHeight: 1,
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.color = '#e53935')
                                        }
                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#ccc')}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
