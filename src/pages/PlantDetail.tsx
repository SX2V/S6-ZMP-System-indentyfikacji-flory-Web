import React from 'react';

export const PlantDetail = () => {
    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                <div className="card">
                    <div className="tag" style={{ marginBottom: 10 }}>Kolekcja Znajomego</div>
                    <div style={{ height: 200, background: 'var(--mist)', borderRadius: 8 }}></div>
                    <h2>Paproć Orlica</h2>
                    <p style={{ color: '#666' }}>Pteridium aquilinum</p>
                    <hr style={{ margin: '15px 0', opacity: 0.2 }} />
                    <p>Znaleziona: 12.05.2024</p>
                    <p>Lokalizacja: Las Kabacki</p>
                </div>

                <div className="card" style={{ border: '2px solid var(--forest)' }}>
                    <div className="tag" style={{ background: 'var(--forest)', color: 'white', marginBottom: 10 }}>Twoje Znalezisko</div>
                    <div style={{ height: 200, background: 'var(--dew)', borderRadius: 8 }}></div>
                    <h2>Paproć Orlica</h2>
                    <p style={{ color: 'var(--forest)' }}>Zidentyfikowano: 98% pewności</p>
                    <hr style={{ margin: '15px 0', opacity: 0.2 }} />
                    <p>Data: 01.06.2024</p>
                    <button className="btn-primary" style={{ width: '100%' }}>Dodaj notatkę porównawczą</button>
                </div>
            </div>
        </div>
    );
};