import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export const UserHerbarium = () => {
    const { id } = useParams();
    const [plants, setPlants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/herbaria/${id}/plants`).then(res => setPlants(res.data));
    }, [id]);

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
            <h2>Eksponaty w zielniku</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginTop: 24 }}>
                {plants.map((p: any) => (
                    <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/herbarium/${id}/plant/${p.id}`)}>
                        <div style={{ height: 150, background: 'var(--dew)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50 }}>🌿</div>
                        <div style={{ padding: 15 }}>
                            <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--fern)', fontStyle: 'italic' }}>{p.detectedSpecies}</div>
                            <button className="btn-primary" style={{ width: '100%', marginTop: 10, fontSize: 12 }}>Porównaj</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};