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
import { LANGUAGES } from '@/shared/i18n/i18n.ts';

export function LanguageMenuItem() {
    const { i18n, t } = useTranslation(['sidebar']);

    return (
        <SidebarMenuItem>
            <Select
                onValueChange={(value) => {
                    value && i18n.changeLanguage(value);
                }}
                value={i18n.resolvedLanguage}
            >
                {/* The sidebar button keeps the item aligned with the theme switch and collapses to its icon. */}
                <SelectPrimitive.Trigger
                    aria-label={t('language')}
                    render={<SidebarMenuButton tooltip={t('language')} />}
                >
                    <Languages aria-hidden="true" />
                    <span>{i18n.resolvedLanguage && LANGUAGES[i18n.resolvedLanguage]}</span>
                </SelectPrimitive.Trigger>
                <SelectContent alignItemWithTrigger={false} side="top">
                    <SelectGroup>
                        {Object.keys(LANGUAGES).map((lang) => (
                            <SelectItem key={lang} lang={lang} value={lang}>
                                {LANGUAGES[lang]}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </SidebarMenuItem>
    );
}
