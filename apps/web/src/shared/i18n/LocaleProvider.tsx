import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { LocaleContext, type TranslationParameters } from './locale-context.ts';
import {
    DEFAULT_LANGUAGE,
    formatLocale,
    isLanguage,
    translations,
    type Language,
    type TranslationKey,
} from './translations.ts';

const LANGUAGE_STORAGE_KEY = 'gytt.language';

interface LocaleProviderProps {
    children: ReactNode;
    initialLanguage?: Language;
}

function getInitialLanguage(initialLanguage?: Language): Language {
    if (initialLanguage !== undefined) {
        return initialLanguage;
    }
    try {
        const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return isLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
    } catch {
        return DEFAULT_LANGUAGE;
    }
}

export function LocaleProvider({ children, initialLanguage }: LocaleProviderProps) {
    const [language, setLanguage] = useState(() => getInitialLanguage(initialLanguage));
    const locale = formatLocale(language);

    useEffect(() => {
        document.documentElement.lang = language;
        try {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        } catch {
            // The in-memory language selection remains usable when storage is unavailable.
        }
    }, [language]);

    const t = useCallback(
        (key: TranslationKey, parameters: TranslationParameters = {}) => {
            const template = translations[language][key];
            return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
                String(parameters[name] ?? placeholder),
            );
        },
        [language],
    );

    const value = useMemo(() => ({ language, locale, setLanguage, t }), [language, locale, t]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
