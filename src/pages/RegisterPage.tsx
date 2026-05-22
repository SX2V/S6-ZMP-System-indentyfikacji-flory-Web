import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { createRegisterSchema, type RegisterFormValues } from '../schemats/registerSchema';
import { useTranslation } from '../hooks/useTranslation';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [strength, setStrength] = useState(0);
    const [serverErrorKey, setServerErrorKey] = useState<string | null>(null);
    const { t, lang } = useTranslation();

    const resolverRef = React.useRef(zodResolver(createRegisterSchema(lang as 'pl' | 'en')));

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: (values, context, options) => resolverRef.current(values, context, options),
        mode: 'onTouched',
    });

    useEffect(() => {
        resolverRef.current = zodResolver(createRegisterSchema(lang as 'pl' | 'en'));
        const touched = Object.keys(formState.touchedFields) as (keyof RegisterFormValues)[];
        if (touched.length > 0) trigger(touched);
    }, [lang]);

    const password = watch('password', '');

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
        setServerErrorKey(null);
        try {
            await authApi.register(data.username, data.email, data.password);
            alert(t('registerSuccess'));
            navigate('/login');
        } catch (error: any) {
            setServerErrorKey(error.response?.data?.message || 'serverError');
        }
    };

    return (
        <div
            className="fade-up"
            style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}
        >
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--moss)', marginBottom: '10px' }}>
                    {t('createAccount')}
                </h2>
                <p
                    style={{
                        textAlign: 'center',
                        color: '#7a9e75',
                        fontSize: '14px',
                        marginBottom: '30px',
                    }}
                >
                    {t('registerSubtitle')}
                </p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
                            {t('username')}
                        </label>
                        <input
                            {...register('username')}
                            placeholder={t('usernamePlaceholder')}
                            style={{ width: '100%', padding: '12px' }}
                        />
                        {errors.username && (
                            <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>
                                {errors.username.message}
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
                            {t('email')}
                        </label>
                        <input
                            {...register('email')}
                            placeholder="email@przyklad.pl"
                            style={{ width: '100%', padding: '12px' }}
                        />
                        {errors.email && (
                            <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            {...register('password')}
                            placeholder={t('passwordPlaceholder')}
                            style={{ width: '100%', padding: '12px' }}
                        />
                        <div
                            style={{
                                background: 'var(--dew)',
                                padding: '12px',
                                borderRadius: '8px',
                                marginTop: '10px',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                    color: 'var(--forest)',
                                }}
                            >
                                {t('passwordRequirements')}
                            </p>
                            <ul
                                style={{
                                    fontSize: '11px',
                                    color: '#5a7055',
                                    paddingLeft: '18px',
                                    marginBottom: '8px',
                                }}
                            >
                                <li
                                    style={{
                                        color: password.length >= 8 ? 'var(--forest)' : '#888',
                                    }}
                                >
                                    {t('reqLength')}
                                </li>
                                <li
                                    style={{
                                        color: /[A-Z]/.test(password) ? 'var(--forest)' : '#888',
                                    }}
                                >
                                    {t('reqUpper')}
                                </li>
                                <li
                                    style={{
                                        color: /[a-z]/.test(password) ? 'var(--forest)' : '#888',
                                    }}
                                >
                                    {t('reqLower')}
                                </li>
                                <li
                                    style={{
                                        color: /[0-9]/.test(password) ? 'var(--forest)' : '#888',
                                    }}
                                >
                                    {t('reqDigit')}
                                </li>
                                <li
                                    style={{
                                        color: /[^a-zA-Z0-9]/.test(password)
                                            ? 'var(--forest)'
                                            : '#888',
                                    }}
                                >
                                    {t('reqSpecial')}
                                </li>
                            </ul>
                            <div
                                style={{
                                    height: '4px',
                                    width: '100%',
                                    backgroundColor: '#ddd',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${(strength / 4) * 100}%`,
                                        backgroundColor: getStrengthColor(),
                                        transition: 'width 0.3s',
                                    }}
                                />
                            </div>
                        </div>
                        {errors.password && (
                            <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>
                            {t('confirmPassword')}
                        </label>
                        <input
                            type="password"
                            {...register('confirmPassword')}
                            style={{ width: '100%', padding: '12px' }}
                        />
                        {errors.confirmPassword && (
                            <p style={{ color: 'red', fontSize: '11px', marginTop: '5px' }}>
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                    {serverErrorKey && (
                        <div
                            style={{
                                background: '#ffebee',
                                color: '#c62828',
                                padding: '10px',
                                borderRadius: '6px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontSize: '13px',
                            }}
                        >
                            {serverErrorKey === 'serverError' ? t('serverError') : serverErrorKey}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('processing') : t('registerBtn')}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
                    {t('alreadyAccount')}{' '}
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--forest)',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                        }}
                    >
                        {t('login')}
                    </Link>
                </p>
            </div>
        </div>
    );
};
