import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { herbariaApi } from '../api/herbaria';
import type { HerbariumResponse } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';

export const Dashboard = () => {
    const [herbaria, setHerbaria] = useState<HerbariumResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const load = () => {
        herbariaApi
            .getMyHerbaria()
            .then((res) => setHerbaria(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ marginBottom: 24 }}>
                <h1>{t('myVirtualHerbarium')}</h1>
            </div>

            {loading && <p style={{ color: '#888' }}>{t('loading')}</p>}

            {!loading && herbaria.length === 0 && (
                <div className="card" style={{ textAlign: 'center', color: '#888', padding: 60 }}>
                    {t('noHerbariaYet')}
                </div>
            )}

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
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 5,
                                }}
                            >
                                <h3>{h.name}</h3>
                                {h.public && (
                                    <span className="tag" style={{ fontSize: 10 }}>
                                        Public
                                    </span>
                                )}
                            </div>
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
                                    onClick={() => navigate(`/herbarium/${h.id}`)}
                                >
                                    {t('view')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
