import { z } from 'zod';
import { pl } from '../i18n/pl';
import { en } from '../i18n/en';

type Lang = 'pl' | 'en';

const msgs = { pl, en };

export const createRegisterSchema = (lang: Lang) => {
    const t = (key: keyof typeof pl) => msgs[lang][key] ?? msgs['pl'][key];

    return z
        .object({
            username: z.string().min(3, t('usernameMinLength')),
            email: z.string().email(t('emailInvalid')),
            password: z
                .string()
                .min(8)
                .regex(/[A-Z]/, t('reqUpper'))
                .regex(/[a-z]/, t('reqLower'))
                .regex(/[0-9]/, t('reqDigit'))
                .regex(/[^a-zA-Z0-9]/, t('reqSpecial')),
            confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t('passwordMismatch'),
            path: ['confirmPassword'],
        });
};

export type RegisterFormValues = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};
