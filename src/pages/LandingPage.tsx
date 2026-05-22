import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
    { value: "12 480", label: "Zidentyfikowanych roślin" },
    { value: "3 200", label: "Aktywnych zbieraczy" },
    { value: "847", label: "Gatunków w bazie" },
];

export const LandingPage = () => {
    return (
        <div className="fade-up">
            <section style={{ padding: "90px 40px", textAlign: "center", background: "linear-gradient(160deg, #eaf4e7 0%, var(--cream) 60%)" }}>
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    <span className="tag" style={{ marginBottom: 16 }}>🌱 Nowe — AI rozpoznawanie gatunków</span>
                    <h1 style={{ fontSize: "3.5rem", lineHeight: 1.15, color: "var(--moss)", marginBottom: 20 }}>
                        Twój wirtualny <br /> <em style={{ color: "var(--forest)" }}>zielnik w kieszeni</em>
                    </h1>
                    <p style={{ fontSize: 18, color: "#5a7055", marginBottom: 36, lineHeight: 1.6 }}>
                        Odkrywaj polską florę, identyfikuj rośliny aparatem i twórz niepowtarzalne kolekcje botaniczne.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <Link to="/register" className="btn-primary" style={{ padding: "13px 30px", fontSize: 16 }}>Zacznij za darmo →</Link>
                        <Link to="/public" className="btn-outline" style={{ padding: "13px 30px", fontSize: 16 }}>Przeglądaj zielniki</Link>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 64, maxWidth: 600, margin: "64px auto 0" }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ flex: 1, padding: "16px 0", borderLeft: i > 0 ? "1px solid #cde4c7" : "none" }}>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: "var(--forest)", fontWeight: 700 }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: "#7a9e75" }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};