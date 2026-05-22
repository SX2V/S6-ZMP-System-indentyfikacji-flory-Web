import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { herbariaApi } from '../api/herbaria';
import type { PlantResponse } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';

export const FriendHerbariumDetail = () => {
    const { friendId, herbariumId } = useParams<{ friendId: string; herbariumId: string }>();
    const [plants, setPlants] = useState<PlantResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!herbariumId) return;
        herbariaApi
            .getPlants(herbariumId)
            .then((res) => setPlants(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [herbariumId]);

    const photoUrl = (url: string): string | null => {
        if (!url) return null;
        const lower = url.toLowerCase().trimStart();
        if (
            lower.startsWith('javascript:') ||
            lower.startsWith('data:') ||
            lower.startsWith('vbscript:')
        )
            return null;
        if (url.startsWith('http')) return url;
        const filename = url.startsWith('/photos/') ? url.slice(8) : url;
        const base = import.meta.env.DEV ? '/api' : 'https://ezielnik-production.up.railway.app';
        return `${base}/photos/${filename}`;
    };
    const mainPhoto = (p: PlantResponse): string | null =>
        p.photos?.[0]?.url ? photoUrl(p.photos[0].url) : null;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ marginBottom: 24 }}>
                <button
                    className="btn-outline"
                    onClick={() => navigate(`/friend/${friendId}/herbaria`)}
                    style={{ fontSize: 13 }}
                >
                    {t('backToHerbarium')}
                </button>
            </div>

            <h2 style={{ color: 'var(--moss)' }}>{t('exhibits')}</h2>

            {loading && <p style={{ color: '#888', marginTop: 20 }}>{t('loading')}</p>}

            {!loading && plants.length === 0 && (
                <div
                    className="card"
                    style={{ textAlign: 'center', color: '#888', padding: 60, marginTop: 24 }}
                >
                    {t('noPlants')}
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 20,
                    marginTop: 24,
                }}
            >
                {plants.map((p) => (
                    <div
                        key={p.id}
                        className="card"
                        style={{ cursor: 'pointer', padding: 0 }}
                        onClick={() =>
                            navigate(`/friend/${friendId}/herbarium/${herbariumId}/plant/${p.id}`)
                        }
                    >
                        <div
                            style={{
                                height: 150,
                                background: 'var(--dew)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                borderRadius: '12px 12px 0 0',
                            }}
                        >
                            {mainPhoto(p) ? (
                                <img
                                    src={mainPhoto(p) as string}
                                    alt={p.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ fontSize: 50 }}>🌿</span>
                            )}
                        </div>
                        <div style={{ padding: 15 }}>
                            <div style={{ fontWeight: 'bold' }}>{p.name || t('noName')}</div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: 'var(--fern)',
                                    fontStyle: 'italic',
                                    marginTop: 4,
                                }}
                            >
                                {p.detectedSpecies}
                            </div>
                            {p.family && (
                                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                                    {t('family')}: {p.family}
                                </div>
                            )}
                            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                                <span className="tag">
                                    {p.photos?.length ?? 0} {t('photos')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
