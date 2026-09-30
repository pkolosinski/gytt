import { describe, expect, it } from 'vitest';

import { detectBrowserLanguage } from './languages.ts';

describe('browser language detection', () => {
    it('matches supported languages by their primary subtag', () => {
        expect(detectBrowserLanguage(['pl-PL', 'en-US'])).toBe('pl');
        expect(detectBrowserLanguage(['EN-gb'])).toBe('en');
    });

    it('uses the first supported language in preference order', () => {
        expect(detectBrowserLanguage(['de-DE', 'pl', 'en'])).toBe('pl');
    });

    it('falls back to English when no preference is supported', () => {
        expect(detectBrowserLanguage(['de-DE', 'fr'])).toBe('en');
        expect(detectBrowserLanguage([])).toBe('en');
    });
});
