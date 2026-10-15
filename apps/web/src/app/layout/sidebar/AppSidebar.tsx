import { Link } from 'react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/shared/generated/shadcn/ui/sidebar.tsx';
import { SectionsMenu } from './SectionsMenu.tsx';
import { UserPreferencesMenu } from './UserPreferencesMenu.tsx';

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SectionsMenu />
      </SidebarContent>
      <SidebarFooter>
        <UserPreferencesMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarLogo() {
  const { open } = useSidebar();
  
  return (
    <Link to="/" className="flex items-center gap-2">
      {/* Placeholder until the GYTT logo asset exists. */}
      <span
        aria-hidden="true"
        className="font-heading flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
      >
        G
      </span>
      {open && <span className="font-heading text-lg">GYTT</span>}
    </Link>
  );
}
