import { useTranslation } from 'react-i18next';

import { ModeToggle } from '@/shared/components/mode-toggle.tsx';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/generated/shadcn/ui/sidebar.tsx';

export function ThemeMenuItem() {
    const { t } = useTranslation();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton role="switch" tooltip={t('app.darkTheme')}>
                <ModeToggle />
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
