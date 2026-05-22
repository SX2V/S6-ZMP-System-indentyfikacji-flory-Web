import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { friendsApi } from '../api/friends';
import { herbariaApi } from '../api/herbaria';
import type { HerbariumResponse, PlantResponse } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';

export const FriendHerbaria = () => {
    const { friendId } = useParams<{ friendId: string }>();
    const [herbaria, setHerbaria] = useState<HerbariumResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!friendId) return;
        friendsApi
            .getFriendHerbaria(friendId)
            .then((res) => setHerbaria(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [friendId]);

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--moss)', marginBottom: 8 }}>
                {t('friendHerbaria')}
            </h1>
            <p style={{ color: '#7a9e75', marginBottom: 32 }}>{t('publicSubtitle')}</p>

            {loading && <p style={{ textAlign: 'center', color: '#888' }}>{t('loading')}</p>}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 20,
                }}
            >
                {herbaria.map((h, i) => (
                    <div
                        key={h.id}
                        className="card fade-up"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        <div
                            style={{
                                height: 110,
                                background: 'var(--mist)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 44,
                            }}
                        >
                            🌿
                        </div>
                        <div style={{ padding: 20 }}>
                            <h3 style={{ marginBottom: 5 }}>{h.name}</h3>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: '#6a8a65',
                                    height: 40,
                                    overflow: 'hidden',
                                }}
                            >
                                {h.description}
                            </p>
                            <div
                                style={{
                                    marginTop: 15,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span className="tag">
                                    🌱 {h.plantCount} {t('plants')}
                                </span>
                                <button
                                    className="btn-outline"
                                    onClick={() =>
                                        navigate(`/friend/${friendId}/herbarium/${h.id}`)
                                    }
                                >
                                    {t('view')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && herbaria.length === 0 && (
                <div className="card" style={{ textAlign: 'center', color: '#888', padding: 60 }}>
                    {t('noHerbaria')}
                </div>
            )}
        </div>
    );
};
