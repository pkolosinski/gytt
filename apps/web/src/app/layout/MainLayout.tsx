import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

import { AnimatedSidebarTrigger } from '@/app/layout/sidebar/AnimatedSidebarTrigger.tsx';
import { Separator } from '@/shared/generated/shadcn/ui/separator.tsx';
import { SidebarProvider } from '@/shared/generated/shadcn/ui/sidebar.tsx';
import { AppSidebar } from './sidebar/AppSidebar.tsx';

export function MainLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const pathnameToSection = (pathname: string): string => {
    if (pathname.startsWith('/habits')) {
      return t('sections.habits');
    }
    if (pathname.startsWith('/tasks')) {
      return t('sections.tasks');
    }
    return t('sections.dashboard');
  };

  return (
    <SidebarProvider className="p-2">
      <AppSidebar />
      <main className="flex min-h-svh flex-1 flex-col">
        <header className="flex items-center gap-3 border-b p-2">
          <AnimatedSidebarTrigger />
          <Separator orientation="vertical" />
          <span>{pathnameToSection(pathname)}</span>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
