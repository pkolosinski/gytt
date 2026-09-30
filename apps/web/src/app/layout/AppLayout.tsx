import type { CSSProperties } from 'react';

import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import {
    SidebarInset,
    SidebarProvider,
    useSidebar,
} from '@/shared/generated/shadcn/ui/sidebar.tsx';

import { AppSidebar } from './AppSidebar.tsx';

const sidebarStyle: CSSProperties & { '--sidebar-width-icon': string } = {
    '--sidebar-width-icon': '4rem',
};

function MobileSidebarTrigger() {
    const { t } = useTranslation();
    const { setOpenMobile } = useSidebar();

    return (
        <Button
            aria-label={t('app.openMenu')}
            className="-ml-1 self-start md:hidden"
            onClick={() => setOpenMobile(true)}
            size="icon-sm"
            variant="ghost"
        >
            <Menu aria-hidden="true" />
        </Button>
    );
}

export function AppLayout() {
    return (
        <SidebarProvider className="h-svh" style={sidebarStyle}>
            <AppSidebar />
            <SidebarInset className="min-h-0 min-w-0">
                {/* The content area, not the document, scrolls so pages can fill the viewport. */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <MobileSidebarTrigger />
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
