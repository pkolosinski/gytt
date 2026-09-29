import { createContext } from 'react';

import type { Language, TranslationKey } from './translations.ts';

export type TranslationParameters = Record<string, string | number>;

export type LocaleContextValue = {
    language: Language;
    locale: string;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, parameters?: TranslationParameters) => string;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
