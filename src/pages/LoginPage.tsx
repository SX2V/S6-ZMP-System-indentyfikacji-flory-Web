import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginResponse } from '../types/auth';

const loginSchema = z.object({
    login: z.string().min(1, "Login lub email jest wymagany"),
    password: z.string().min(1, "Hasło jest wymagane"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const [apiError, setApiError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        setApiError(null);
        try {
            const response = await api.post<LoginResponse>('/users/login', data);
            const { token, admin, username } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('isAdmin', String(admin));
            localStorage.setItem('username', username);

            if (response.data.warning) {
                alert(`Ostrzeżenie: ${response.data.warning}`);
            }

            navigate(admin ? '/admin' : '/dashboard');
        } catch (error: any) {
            setApiError(error.response?.data?.message || "Błędny login lub hasło");
        }
    };

    return (
        <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <span style={{ fontSize: '40px' }}>🔐</span>
                    <h2 style={{ color: 'var(--moss)', marginTop: '10px' }}>Witaj ponownie</h2>
                    <p style={{ color: '#7a9e75', fontSize: '14px' }}>Zaloguj się do swojego zielnika</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Login lub Email</label>
                        <input {...register('login')} placeholder="Wpisz dane" style={{ width: '100%', padding: '12px' }} />
                        {errors.login && <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>{errors.login.message}</p>}
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Hasło</label>
                        <input type="password" {...register('password')} placeholder="Twoje hasło" style={{ width: '100%', padding: '12px' }} />
                        {errors.password && <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>{errors.password.message}</p>}
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                        <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--fern)', textDecoration: 'none' }}>
                            Zapomniałeś hasła?
                        </Link>
                    </div>

                    {apiError && (
                        <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}>
                            {apiError}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                        {isSubmitting ? 'Łączenie...' : 'Zaloguj się'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '13px', color: '#7a9e75', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    Nie masz jeszcze konta? <br/>
                    <Link to="/register" style={{ color: 'var(--forest)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginTop: '5px' }}>
                        Zarejestruj się za darmo
                    </Link>
                </div>
            </div>
        </div>
    );
};