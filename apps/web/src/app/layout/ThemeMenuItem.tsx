import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SidebarMenuButton, SidebarMenuItem } from '@/shared/generated/shadcn/ui/sidebar.tsx';
import { useTheme } from '@/shared/theme/use-theme.ts';

export function ThemeMenuItem() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                aria-checked={isDark}
                onClick={toggleTheme}
                role="switch"
                tooltip={t('app.darkTheme')}
            >
                {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
                <span>{t('app.darkTheme')}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
