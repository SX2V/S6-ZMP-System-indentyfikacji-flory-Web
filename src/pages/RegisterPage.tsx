import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '../schemats/registerSchema';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [strength, setStrength] = useState(0);
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched"
    });

    const password = watch("password", "");

    useEffect(() => {
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^a-zA-Z0-9]/.test(password)) s++;
        setStrength(s);
    }, [password]);

    const getStrengthColor = () => {
        if (strength === 0) return '#e0e0e0';
        if (strength <= 2) return '#f44336';
        if (strength === 3) return '#ffeb3b';
        return 'var(--forest)';
    };

    const onSubmit = async (data: RegisterFormValues) => {
        setServerError(null);
        try {
            await api.post('/users/register', {
                username: data.username,
                email: data.email,
                password: data.password
            });
            alert("Konto założone pomyślnie!");
            navigate('/login');
        } catch (error: any) {
            setServerError(error.response?.data?.message || "Błąd połączenia z serwerem.");
        }
    };

    return (
        <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--moss)', marginBottom: '10px' }}>Stwórz konto</h2>
                <p style={{ textAlign: 'center', color: '#7a9e75', fontSize: '14px', marginBottom: '30px' }}>Wypełnij dane, aby dołączyć do społeczności.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Nazwa użytkownika</label>
                        <input {...register('username')} placeholder="Twój login" style={{ width: '100%', padding: '12px' }} />
                        {errors.username && <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>{errors.username.message}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>E-mail</label>
                        <input {...register('email')} placeholder="email@przyklad.pl" style={{ width: '100%', padding: '12px' }} />
                        {errors.email && <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>{errors.email.message}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Hasło</label>
                        <input type="password" {...register('password')} placeholder="Wprowadź hasło" style={{ width: '100%', padding: '12px' }} />

                        <div style={{ background: 'var(--dew)', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '5px', color: 'var(--forest)' }}>Wymagania bezpieczeństwa:</p>
                            <ul style={{ fontSize: '11px', color: '#5a7055', paddingLeft: '18px' }}>
                                <li style={{ color: password.length >= 8 ? 'var(--forest)' : '#888' }}>Minimum 8 znaków</li>
                                <li style={{ color: /[A-Z]/.test(password) ? 'var(--forest)' : '#888' }}>Przynajmniej jedna wielka litera</li>
                                <li style={{ color: /[0-9]/.test(password) ? 'var(--forest)' : '#888' }}>Przynajmniej jedna cyfra</li>
                                <li style={{ color: /[^a-zA-Z0-9]/.test(password) ? 'var(--forest)' : '#888' }}>Znak specjalny (np. ! @ # $)</li>
                            </ul>
                            <div style={{ height: '4px', width: '100%', backgroundColor: '#ddd', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(strength / 4) * 100}%`, backgroundColor: getStrengthColor(), transition: 'width 0.3s' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Powtórz hasło</label>
                        <input type="password" {...register('confirmPassword')} style={{ width: '100%', padding: '12px' }} />
                        {errors.confirmPassword && <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>{errors.confirmPassword.message}</p>}
                    </div>

                    {serverError && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontSize: '13px' }}>{serverError}</div>}

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Przetwarzanie...' : 'Zarejestruj się'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
                    Masz już konto? <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 'bold', textDecoration: 'none' }}>Zaloguj się</Link>
                </p>
            </div>
        </div>
    );
};