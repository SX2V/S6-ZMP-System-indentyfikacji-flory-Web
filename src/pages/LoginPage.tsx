import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const loginSchema = z.object({
    login: z.string().min(1),
    password: z.string().min(1),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const [apiErrorKey, setApiErrorKey] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setApiErrorKey(null);
        try {
            const response = await authApi.login(data.login, data.password);
            const res = response.data;
            localStorage.setItem('token', res.token);
            localStorage.setItem('refreshToken', res.refreshToken);
            localStorage.setItem('isAdmin', String(res.admin));
            localStorage.setItem('username', res.username);
            localStorage.setItem('userId', res.id);
            if (res.warning) alert(`${t('warning')}: ${res.warning}`);
            navigate(res.admin ? '/admin' : '/dashboard');
        } catch (error: any) {
            setApiErrorKey(error.response?.data?.message || 'loginError');
        }
    };

    return (
        <div
            className="fade-up"
            style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}
        >
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <span style={{ fontSize: '40px' }}>🔐</span>
                    <h2 style={{ color: 'var(--moss)', marginTop: '10px' }}>{t('welcomeBack')}</h2>
                    <p style={{ color: '#7a9e75', fontSize: '14px' }}>{t('loginSubtitle')}</p>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(onSubmit)(e);
                    }}
                >
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
                            {t('loginLabel')}
                        </label>
                        <input
                            {...register('login')}
                            placeholder={t('loginPlaceholder')}
                            style={{ width: '100%', padding: '12px' }}
                        />
                        {errors.login && (
                            <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>
                                {t('loginRequired')}
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            {...register('password')}
                            placeholder={t('passwordPlaceholder')}
                            style={{ width: '100%', padding: '12px' }}
                        />
                        {errors.password && (
                            <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>
                                {t('passwordRequired')}
                            </p>
                        )}
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                        <Link
                            to="/forgot-password"
                            style={{
                                fontSize: '12px',
                                color: 'var(--fern)',
                                textDecoration: 'none',
                            }}
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>
                    {apiErrorKey && (
                        <div
                            style={{
                                padding: '12px',
                                backgroundColor: '#ffebee',
                                color: '#c62828',
                                marginBottom: '20px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                textAlign: 'center',
                            }}
                        >
                            {apiErrorKey === 'loginError' ? t('loginError') : apiErrorKey}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
                    >
                        {isSubmitting ? t('connecting') : t('login')}
                    </button>
                </form>
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '25px',
                        fontSize: '13px',
                        color: '#7a9e75',
                        borderTop: '1px solid #eee',
                        paddingTop: '20px',
                    }}
                >
                    {t('noAccount')}
                    <br />
                    <Link
                        to="/register"
                        style={{
                            color: 'var(--forest)',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            display: 'inline-block',
                            marginTop: '5px',
                        }}
                    >
                        {t('registerFree')}
                    </Link>
                </div>
            </div>
        </div>
    );
};
