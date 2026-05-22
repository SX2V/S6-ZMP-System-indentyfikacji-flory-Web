import { useState, useEffect } from 'react';
import { pl } from '../i18n/pl';
import { en } from '../i18n/en';

type Lang = 'pl' | 'en';
type TranslationKey = keyof typeof pl;

const translations = { pl, en };

const LANG_CHANGE_EVENT = 'langChange';

export const getLang = (): Lang => (localStorage.getItem('lang') as Lang) || 'pl';

export const setLang = (lang: Lang) => {
    localStorage.setItem('lang', lang);
    window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: lang }));
};

export const useTranslation = () => {
    const [lang, setLangState] = useState<Lang>(getLang());

    useEffect(() => {
        const handler = (e: Event) => {
            const newLang = (e as CustomEvent<Lang>).detail || getLang();
            setLangState(newLang);
        };
        window.addEventListener(LANG_CHANGE_EVENT, handler);
        return () => window.removeEventListener(LANG_CHANGE_EVENT, handler);
    }, []);

    const t = (key: TranslationKey): string => {
        return translations[lang][key] ?? translations['pl'][key] ?? key;
    };

    return { t, lang, setLang };
};
