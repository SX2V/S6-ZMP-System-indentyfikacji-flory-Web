import React, { useState } from 'react';
import api from '../api/axiosConfig';

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        try {
            await api.post('/users/forgot-password', { email });
            setSent(true);
        } catch (e) { alert("Błąd wysyłania"); }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <div className="card" style={{ width: 400, textAlign: 'center', padding: 40 }}>
                <h2>Resetowanie hasła</h2>
                {sent ? (
                    <p style={{ color: 'var(--forest)', marginTop: 20 }}>Instrukcje zostały wysłane na Twój e-mail.</p>
                ) : (
                    <>
                        <p style={{ margin: '15px 0', fontSize: 14 }}>Podaj e-mail powiązany z kontem.</p>
                        <input type="email" placeholder="email@przyklad.pl" style={{ width: '100%', marginBottom: 20 }} onChange={e => setEmail(e.target.value)} />
                        <button className="btn-primary" style={{ width: '100%' }} onClick={handleReset}>Wyślij link</button>
                    </>
                )}
            </div>
        </div>
    );
};