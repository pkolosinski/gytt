import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

export const LANGUAGES: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
} as const;

const NAMESPACES = [
  'common',
  'dashboard',
  'habits',
  'placeholder',
  'sidebar',
  'tasks',
] as const;

i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .use(LanguageDetector)
  .init({
    supportedLngs: Object.keys(LANGUAGES),
    interpolation: { escapeValue: false },
    load: 'languageOnly',
    ns: NAMESPACES,
    defaultNS: 'common',
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
