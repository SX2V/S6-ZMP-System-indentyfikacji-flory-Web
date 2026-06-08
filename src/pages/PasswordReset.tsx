import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';
import { useTranslation } from '../hooks/useTranslation';

const resetSchema = (lang: 'pl' | 'en') =>
    z.object({
        email: z
            .string()
            .email(lang === 'pl' ? 'Niepoprawny adres email' : 'Invalid email address'),
    });
type ResetFormValues = { email: string };

export const ForgotPassword = () => {
    const [sent, setSent] = useState(false);
    const { t, lang } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema(lang as 'pl' | 'en')),
        mode: 'onTouched',
    });

    const onSubmit = async (data: ResetFormValues) => {
        try {
            await authApi.forgotPassword(data.email);
            setSent(true);
        } catch {
            alert(t('sendError'));
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                padding: '20px',
            }}
        >
            <div
                className="card"
                style={{ width: '100%', maxWidth: 400, textAlign: 'center', padding: 40 }}
            >
                <h2>{t('resetPassword')}</h2>
                {sent ? (
                    <p style={{ color: 'var(--forest)', marginTop: 20 }}>{t('resetSent')}</p>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <p style={{ margin: '15px 0', fontSize: 14 }}>{t('resetSubtitle')}</p>
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="email@przyklad.pl"
                            style={{ width: '100%', marginBottom: 6, padding: 12 }}
                        />
                        {errors.email && (
                            <p
                                style={{
                                    color: 'red',
                                    fontSize: '11px',
                                    marginBottom: 14,
                                    textAlign: 'left',
                                }}
                            >
                                {errors.email.message}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', marginTop: 14 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '...' : t('sendLink')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
