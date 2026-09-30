import { initI18n } from '@/shared/i18n/i18n.ts';

// jsdom does not implement matchMedia, which the sidebar and theme rely on.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string): MediaQueryList => ({
        addEventListener: () => {},
        addListener: () => {},
        dispatchEvent: () => false,
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: () => {},
        removeListener: () => {},
    });
}

// Tests assert English copy regardless of the machine's locale.
await initI18n('en');
