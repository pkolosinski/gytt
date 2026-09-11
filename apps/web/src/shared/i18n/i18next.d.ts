import 'i18next';

import type { Dictionary } from './locales/en.ts';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: { translation: Dictionary };
    }
}
