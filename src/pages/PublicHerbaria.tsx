import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export const PublicHerbaria = () => {
    const [herbaria, setHerbaria] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/herbaria/public').then(res => setHerbaria(res.data));
    }, []);

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
            <h1 style={{ fontSize: "2rem", color: "var(--moss)" }}>Publiczne zielniki</h1>
            <p style={{ color: "#7a9e75", marginBottom: 32 }}>Odkrywaj kolekcje botaniczne polskiej społeczności</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {herbaria.map((h: any, i) => (
                    <div key={h.id} className="card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div style={{ height: 110, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🌿</div>
                        <div style={{ padding: 20 }}>
                            <h3 style={{ marginBottom: 5 }}>{h.name}</h3>
                            <p style={{ fontSize: 13, color: '#6a8a65', height: 40, overflow: 'hidden' }}>{h.description}</p>
                            <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="tag">🌱 {h.plantCount} roślin</span>
                                <button className="btn-outline" onClick={() => navigate(`/herbarium/${h.id}`)}>Zobacz</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};