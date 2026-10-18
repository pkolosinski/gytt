import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { LayoutDashboard, ListTodo, Repeat2, type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/generated/shadcn/ui/sidebar.tsx';

const sections = [
  { id: 'dashboard', icon: LayoutDashboard, link: '/' },
  { id: 'tasks', icon: ListTodo, link: '/tasks' },
  { id: 'habits', icon: Repeat2, link: '/habits/day' },
];

export function SectionsMenu() {
  const { t } = useTranslation('sidebar');

  return (
    <nav>
      <SidebarGroup>
        <SidebarGroupLabel>{t('menu')}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {sections.map((section) => (
              <SectionNavItem
                key={section.link}
                id={section.id}
                link={section.link}
                Icon={section.icon}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </nav>
  );
}

type SectionNavItemProps = {
  Icon: LucideIcon;
  id: string;
  link: string;
}

function SectionNavItem({ Icon, id, link }: SectionNavItemProps) {
  const { t } = useTranslation(['common', 'sidebar']);
  const title = t(`sections.${id}`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<NavLink to={link} />} tooltip={title}>
        <Icon />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
