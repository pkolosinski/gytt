import { useRef, type MouseEvent as ReactMouseEvent } from 'react';

import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, LayoutDashboard, ListChecks, Repeat2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/shared/generated/shadcn/ui/sidebar.tsx';

import { LanguageMenuItem } from './LanguageMenuItem.tsx';
import { ThemeMenuItem } from './ThemeMenuItem.tsx';

type SectionLink = {
    end: boolean;
    icon: LucideIcon;
    id: 'dashboard' | 'tasks' | 'habits';
    matchPath: string;
    to: string;
};

const sections: SectionLink[] = [
    { end: true, icon: LayoutDashboard, id: 'dashboard', matchPath: '/', to: '/' },
    { end: false, icon: ListChecks, id: 'tasks', matchPath: '/tasks', to: '/tasks' },
    { end: false, icon: Repeat2, id: 'habits', matchPath: '/habits', to: '/habits/day' },
];

interface SectionNavItemProps {
    section: SectionLink;
}

function SectionNavItem({ section: { end, icon: Icon, id, matchPath, to } }: SectionNavItemProps) {
    const { t } = useTranslation();
    const { setOpenMobile } = useSidebar();
    const title = t(`app.sections.${id}`);
    const isActive = useMatch({ end, path: matchPath }) !== null;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                aria-current={isActive ? 'page' : undefined}
                isActive={isActive}
                onClick={() => setOpenMobile(false)}
                render={<Link to={to} />}
                tooltip={title}
            >
                <Icon aria-hidden="true" />
                <span>{title}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function SidebarLogo() {
    const { t } = useTranslation();
    const { setOpenMobile } = useSidebar();

    return (
        <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
                <SidebarMenuButton
                    aria-label={t('app.home')}
                    onClick={() => setOpenMobile(false)}
                    render={<Link to="/" />}
                    size="lg"
                    tooltip={t('app.home')}
                >
                    {/* Placeholder until the GYTT logo asset exists. */}
                    <span
                        aria-hidden="true"
                        className="font-heading flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    >
                        G
                    </span>
                    <span aria-hidden="true" className="font-heading text-lg">
                        GYTT
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function SidebarEdgeTrigger({ onToggle }: { onToggle: () => void }) {
    const { t } = useTranslation();
    const { state } = useSidebar();
    const isExpanded = state === 'expanded';
    const label = isExpanded ? t('app.collapseSidebar') : t('app.expandSidebar');

    return (
        <Button
            aria-label={label}
            className="absolute top-6 -right-3.5 z-20 hidden md:inline-flex"
            data-sidebar="edge-trigger"
            onClick={onToggle}
            size="icon-sm"
            title={label}
            variant="outline"
        >
            {isExpanded ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
        </Button>
    );
}

export function AppSidebar() {
    const { t } = useTranslation();
    const { isMobile, setOpen, state, toggleSidebar } = useSidebar();
    const expandedOnHover = useRef(false);

    function handleMouseEnter(event: ReactMouseEvent<HTMLDivElement>) {
        const enteredEdgeTrigger =
            event.target instanceof Element &&
            event.target.closest('[data-sidebar="edge-trigger"]') !== null;

        if (isMobile || state !== 'collapsed' || enteredEdgeTrigger) return;

        expandedOnHover.current = true;
        setOpen(true);
    }

    function handleMouseLeave() {
        if (!expandedOnHover.current) return;

        expandedOnHover.current = false;
        setOpen(false);
    }

    function handleToggle() {
        expandedOnHover.current = false;
        toggleSidebar();
    }

    return (
        <Sidebar collapsible="icon" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <SidebarEdgeTrigger onToggle={handleToggle} />
            <SidebarHeader className="flex-row items-center group-data-[collapsible=icon]:flex-col">
                <SidebarLogo />
            </SidebarHeader>
            <SidebarContent>
                <nav aria-label={t('app.menu')}>
                    <SidebarGroup>
                        <SidebarGroupLabel>{t('app.menu')}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {sections.map((section) => (
                                    <SectionNavItem key={section.to} section={section} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </nav>
                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>{t('app.preferences')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <ThemeMenuItem />
                            <LanguageMenuItem />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
