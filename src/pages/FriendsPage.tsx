import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsApi } from '../api/friends';
import type { FriendResponse } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';

export const FriendsPage = () => {
    const [tab, setTab] = useState<'friends' | 'requests'>('friends');
    const [friends, setFriends] = useState<FriendResponse[]>([]);
    const [requests, setRequests] = useState<FriendResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [addUsername, setAddUsername] = useState('');
    const [addError, setAddError] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const accepted = friends;
    const incoming = requests;

    const load = async () => {
        setLoading(true);
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                friendsApi.getFriends(),
                friendsApi.getRequests(),
            ]);
            setFriends(friendsRes.data);
            setRequests(requestsRes.data);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleAccept = async (friendshipId: string) => {
        try {
            await friendsApi.acceptRequest(friendshipId);
            await load();
        } catch {
            alert(t('acceptError'));
        }
    };

    const handleRemove = async (friendshipId: string) => {
        if (!confirm(t('confirmRemove'))) return;
        try {
            await friendsApi.removeFriend(friendshipId);
            await load();
        } catch {
            alert(t('removeError'));
        }
    };

    const handleAdd = async () => {
        if (!addUsername.trim()) return;
        setAddError(null);
        setAddSuccess(false);
        try {
            await friendsApi.sendRequest(addUsername.trim());
            setAddSuccess(true);
            setAddUsername('');
            await load();
        } catch (e: any) {
            setAddError(e.response?.data?.message || t('userNotFound'));
        }
    };

    const list = tab === 'friends' ? accepted : incoming;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 32,
                }}
            >
                <h1>{t('friendsPage')}</h1>
                <div style={{ background: 'var(--dew)', padding: 4, borderRadius: 8 }}>
                    <button
                        onClick={() => setTab('friends')}
                        className={tab === 'friends' ? 'btn-primary' : 'btn-outline'}
                        style={{ border: 'none' }}
                    >
                        {t('myFriends')} ({accepted.length})
                    </button>
                    <button
                        onClick={() => setTab('requests')}
                        className={tab === 'requests' ? 'btn-primary' : 'btn-outline'}
                        style={{ border: 'none' }}
                    >
                        {t('invitations')} {incoming.length > 0 && `(${incoming.length})`}
                    </button>
                </div>
            </div>

            <div
                className="card"
                style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}
            >
                <input
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={t('addByUsername')}
                    style={{ flex: 1, padding: '10px 14px' }}
                />
                <button className="btn-primary" onClick={handleAdd}>
                    {t('invite')}
                </button>
            </div>
            {addError && (
                <p style={{ color: '#c62828', fontSize: 13, marginBottom: 12 }}>{addError}</p>
            )}
            {addSuccess && (
                <p style={{ color: 'var(--forest)', fontSize: 13, marginBottom: 12 }}>
                    {t('inviteSent')}
                </p>
            )}

            {loading ? (
                <p style={{ color: '#888', textAlign: 'center' }}>{t('loading')}</p>
            ) : list.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                    {tab === 'friends' ? t('noFriends') : t('noPendingRequests')}
                </div>
            ) : (
                <div className="fade-up">
                    {list.map((f) => (
                        <div
                            key={f.friendshipId}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: 15,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'var(--sage)',
                                    marginRight: 15,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                }}
                            >
                                🌿
                            </div>
                            <div style={{ flex: 1 }}>
                                <b>{f.username}</b>
                                <div style={{ fontSize: 12, color: '#999' }}>
                                    {new Date(f.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            {tab === 'requests' ? (
                                <>
                                    <button
                                        className="btn-primary"
                                        style={{ fontSize: 12, marginRight: 8 }}
                                        onClick={() => handleAccept(f.friendshipId)}
                                    >
                                        {t('accept')}
                                    </button>
                                    <button
                                        className="btn-outline"
                                        style={{ fontSize: 12 }}
                                        onClick={() => handleRemove(f.friendshipId)}
                                    >
                                        {t('reject')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn-outline"
                                        style={{ fontSize: 12, marginRight: 8 }}
                                        onClick={() => navigate(`/friend/${f.userId}/herbaria`)}
                                    >
                                        🌿 {t('friendHerbaria')}
                                    </button>
                                    <button
                                        className="btn-outline"
                                        style={{
                                            fontSize: 12,
                                            color: '#c62828',
                                            borderColor: '#c62828',
                                        }}
                                        onClick={() => handleRemove(f.friendshipId)}
                                    >
                                        {t('remove')}
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
