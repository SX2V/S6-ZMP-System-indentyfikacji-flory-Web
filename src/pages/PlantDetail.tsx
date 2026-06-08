import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { herbariaApi } from '../api/herbaria';
import type { PlantResponse, HerbariumResponse } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';

const PlantCard = ({
    plant,
    label,
    highlighted,
    t,
}: {
    plant: PlantResponse;
    label: string;
    highlighted: boolean;
    t: (k: any) => string;
}) => {
    const [photoIdx, setPhotoIdx] = useState(0);
    const photos = plant.photos ?? [];
    const photoUrl = (url: string) => {
        if (!url || url.startsWith('http')) return url;
        const filename = url.startsWith('/photos/') ? url.slice(8) : url;
        const base = import.meta.env.DEV ? '/api' : 'https://ezielnik-production.up.railway.app';
        return `${base}/photos/${filename}`;
    };

    return (
        <div
            className="card"
            style={{
                border: highlighted ? '2px solid var(--forest)' : undefined,
                padding: 0,
                overflow: 'hidden',
            }}
        >
            <div style={{ padding: '15px 20px 0' }}>
                <span
                    className="tag"
                    style={highlighted ? { background: 'var(--forest)', color: 'white' } : {}}
                >
                    {label}
                </span>
            </div>

            <div
                style={{
                    position: 'relative',
                    height: 220,
                    background: 'var(--mist)',
                    margin: '12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {photos.length > 0 ? (
                    <>
                        <img
                            src={photoUrl(photos[photoIdx].url) ?? undefined}
                            alt={plant.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {photos.length > 1 && (
                            <div
                                style={{ position: 'absolute', bottom: 8, display: 'flex', gap: 6 }}
                            >
                                {photos.map((_dot: PlantPhotoResponse, i: number) => (
                                    <div
                                        key={i}
                                        onClick={() => setPhotoIdx(i)}
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background:
                                                i === photoIdx ? 'white' : 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer',
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <span style={{ fontSize: 50 }}>🌿</span>
                )}
            </div>

            <div style={{ padding: '16px 20px 20px' }}>
                <h2 style={{ marginBottom: 4 }}>{plant.name || t('noName')}</h2>
                {plant.detectedSpecies && (
                    <p style={{ color: 'var(--fern)', fontStyle: 'italic', fontSize: 14 }}>
                        {plant.detectedSpecies}
                    </p>
                )}
                <hr style={{ margin: '12px 0', opacity: 0.15 }} />
                <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                    {plant.family && (
                        <div>
                            <b>{t('family')}:</b> {plant.family}
                        </div>
                    )}
                    {plant.genus && (
                        <div>
                            <b>{t('genus')}:</b> {plant.genus}
                        </div>
                    )}
                    {plant.commonNames && (
                        <div>
                            <b>{t('commonNames')}:</b> {plant.commonNames}
                        </div>
                    )}
                    {photos[0]?.confidence != null && (
                        <div style={{ marginTop: 4 }}>
                            <b>{t('confidence')}:</b>{' '}
                            <span style={{ color: 'var(--forest)', fontWeight: 600 }}>
                                {Math.round(photos[0].confidence * 100)}%
                            </span>
                        </div>
                    )}
                    {photos[0]?.description && (
                        <div style={{ marginTop: 4, color: '#666' }}>{photos[0].description}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const PlantDetail = () => {
    const params = useParams<{
        friendId?: string;
        herbariumId: string;
        plantId: string;
    }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { friendId, herbariumId, plantId } = params;
    const isFriendView = !!friendId;
    const token = localStorage.getItem('token');
    const canCompare = isFriendView || !!token; // porównanie dostępne też dla publicznych gdy zalogowany

    const [friendPlant, setFriendPlant] = useState<PlantResponse | null>(null);
    const [myHerbaria, setMyHerbaria] = useState<HerbariumResponse[]>([]);
    const [myPlants, setMyPlants] = useState<PlantResponse[]>([]);
    const [selectedMyPlant, setSelectedMyPlant] = useState<PlantResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!herbariumId || !plantId) return;
        herbariaApi
            .getPlant(herbariumId, plantId)
            .then((res) => setFriendPlant(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));

        if (canCompare) {
            herbariaApi.getMyHerbaria().then((res) => setMyHerbaria(res.data));
        }
    }, [herbariumId, plantId, isFriendView]);

    const handlePickHerbarium = async (hId: string) => {
        const res = await herbariaApi.getPlants(hId);
        setMyPlants(res.data);
    };

    const backUrl = isFriendView
        ? `/friend/${friendId}/herbarium/${herbariumId}`
        : `/herbarium/${herbariumId}`;

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>
                {t('loadingPlant')}
            </div>
        );
    }

    if (!friendPlant) {
        return (
            <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>{t('fetchError')}</div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <button
                className="btn-outline"
                onClick={() => navigate(backUrl)}
                style={{ fontSize: 13, marginBottom: 24 }}
            >
                {t('backToHerbarium')}
            </button>

            <h2 style={{ marginBottom: 24, color: 'var(--moss)' }}>
                {canCompare ? t('compareTitle') : friendPlant.name || t('noName')}
            </h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: canCompare ? '1fr 1fr' : '1fr',
                    gap: 28,
                }}
            >
                <PlantCard
                    plant={friendPlant}
                    label={canCompare ? t('friendCollection') : t('yourCollection')}
                    highlighted={!canCompare}
                    t={t}
                />

                {canCompare && (
                    <div>
                        {selectedMyPlant ? (
                            <PlantCard
                                plant={selectedMyPlant}
                                label={t('yourCollection')}
                                highlighted={true}
                                t={t}
                            />
                        ) : (
                            <div className="card" style={{ padding: 24 }}>
                                <h3 style={{ marginBottom: 16, color: 'var(--moss)' }}>
                                    {t('selectYourPlant')}
                                </h3>

                                <select
                                    onChange={(e) =>
                                        e.target.value && handlePickHerbarium(e.target.value)
                                    }
                                    defaultValue=""
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        marginBottom: 16,
                                        borderRadius: 6,
                                        border: '1px solid #ddd',
                                    }}
                                >
                                    <option value="" disabled>
                                        {t('myHerbarium')}
                                    </option>
                                    {myHerbaria.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.name}
                                        </option>
                                    ))}
                                </select>

                                {myPlants.length > 0 && (
                                    <div
                                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                    >
                                        {myPlants.map((p) => (
                                            <div
                                                key={p.id}
                                                className="card"
                                                onClick={() => setSelectedMyPlant(p)}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                }}
                                            >
                                                <span style={{ fontSize: 24 }}>🌿</span>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                        {p.name || t('noName')}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: 'var(--fern)',
                                                            fontStyle: 'italic',
                                                        }}
                                                    >
                                                        {p.detectedSpecies}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {myPlants.length === 0 && myHerbaria.length > 0 && (
                                    <p style={{ color: '#888', fontSize: 13 }}>
                                        {t('noOwnPlants')}
                                    </p>
                                )}
                            </div>
                        )}

                        {selectedMyPlant && (
                            <button
                                className="btn-outline"
                                onClick={() => setSelectedMyPlant(null)}
                                style={{ width: '100%', marginTop: 12, fontSize: 13 }}
                            >
                                {t('selectYourPlant')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
