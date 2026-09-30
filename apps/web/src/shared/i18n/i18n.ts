import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next, useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, isLanguage, SUPPORTED_LANGUAGES, type Language } from './languages.ts';
import type { Dictionary } from './locales/en.ts';

// Each dictionary is a separate chunk, so only the active language is downloaded.
const dictionaryLoaders: Record<Language, () => Promise<Dictionary>> = {
    en: () => import('./locales/en.ts').then((module) => module.en),
    pl: () => import('./locales/pl.ts').then((module) => module.pl),
};

i18next.on('languageChanged', (language) => {
    if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
    }
});

/** Loads only `language`'s dictionary and initializes the shared i18next instance. */
export async function initI18n(language: Language): Promise<void> {
    await i18next
        .use(
            resourcesToBackend((requested: string) =>
                dictionaryLoaders[isLanguage(requested) ? requested : DEFAULT_LANGUAGE](),
            ),
        )
        .use(initReactI18next)
        .init({
            // Every dictionary is complete, so no fallback language is loaded alongside the active one.
            fallbackLng: false,
            interpolation: { escapeValue: false },
            lng: language,
            load: 'currentOnly',
            supportedLngs: SUPPORTED_LANGUAGES,
        });
}

export function useLanguage() {
    const { i18n } = useTranslation();
    const language = isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE;

    return {
        changeLanguage: (next: Language) => i18n.changeLanguage(next),
        language,
    };
}
