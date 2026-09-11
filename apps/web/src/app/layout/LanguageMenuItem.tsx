import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
} from '@/shared/generated/shadcn/ui/select.tsx';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/generated/shadcn/ui/sidebar.tsx';
import { useLanguage } from '@/shared/i18n/i18n.ts';
import { isLanguage, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '@/shared/i18n/languages.ts';

export function LanguageMenuItem() {
    const { t } = useTranslation();
    const { changeLanguage, language } = useLanguage();

    return (
        <SidebarMenuItem>
            <Select
                onValueChange={(value) => {
                    if (isLanguage(value)) {
                        void changeLanguage(value);
                    }
                }}
                value={language}
            >
                {/* The sidebar button keeps the item aligned with the theme switch and collapses to its icon. */}
                <SelectPrimitive.Trigger
                    aria-label={t('app.language')}
                    render={<SidebarMenuButton tooltip={t('app.language')} />}
                >
                    <Languages aria-hidden="true" />
                    <span>{LANGUAGE_NAMES[language]}</span>
                </SelectPrimitive.Trigger>
                <SelectContent alignItemWithTrigger={false} side="top">
                    <SelectGroup>
                        {SUPPORTED_LANGUAGES.map((option) => (
                            <SelectItem key={option} lang={option} value={option}>
                                {LANGUAGE_NAMES[option]}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </SidebarMenuItem>
    );
}
