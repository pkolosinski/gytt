import i18next from 'i18next';
import { describe, expect, it } from 'vitest';

describe('i18n bootstrap', () => {
    it('loads only the active language dictionary', () => {
        expect(i18next.resolvedLanguage).toBe('en');
        expect(i18next.hasResourceBundle('en', 'translation')).toBe(true);
        expect(i18next.hasResourceBundle('pl', 'translation')).toBe(false);
    });

    it('loads another dictionary on demand when the language changes', async () => {
        await i18next.changeLanguage('pl');

        expect(i18next.t('app.sections.tasks')).toBe('Zadania');
        expect(i18next.hasResourceBundle('pl', 'translation')).toBe(true);
    });
});
