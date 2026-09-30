export const SUPPORTED_LANGUAGES = ['en', 'pl'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

/** Each language is named in itself so users can find theirs regardless of the active one. */
export const LANGUAGE_NAMES: Record<Language, string> = {
    en: 'English',
    pl: 'Polski',
};

export function isLanguage(value: unknown): value is Language {
    return SUPPORTED_LANGUAGES.some((language) => language === value);
}

/** The first supported language in the browser's preference list, matched by primary subtag. */
export function detectBrowserLanguage(
    preferred: readonly string[] = navigator.languages,
): Language {
    for (const tag of preferred) {
        const primary = tag.split('-')[0]?.toLowerCase();
        if (isLanguage(primary)) {
            return primary;
        }
    }
    return DEFAULT_LANGUAGE;
}
