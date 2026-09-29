import { useLocale } from './useLocale.ts';

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLocale();

    return (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('language.label')}</span>
            <select
                aria-label={t('language.label')}
                className="h-9 rounded-lg border border-input bg-background px-2 text-foreground"
                onChange={(event) => setLanguage(event.target.value === 'en' ? 'en' : 'pl')}
                value={language}
            >
                <option value="pl">{t('language.polish')}</option>
                <option value="en">{t('language.english')}</option>
            </select>
        </label>
    );
}
