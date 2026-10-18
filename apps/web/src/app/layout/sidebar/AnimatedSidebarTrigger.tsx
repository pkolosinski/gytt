import { useTranslation } from 'react-i18next';

import { PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from 'lucide-react';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { useSidebar } from '@/shared/generated/shadcn/ui/sidebar.tsx';

export function AnimatedSidebarTrigger() {
  const { t } = useTranslation('sidebar');
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar();
  const isOpen = isMobile ? openMobile : open;
  const label = isOpen ? t('collapseSidebar') : t('expandSidebar');

  return (
    <Button
      aria-label={label}
      className="group"
      onClick={toggleSidebar}
      size="icon"
      title={label}
      variant="ghost"
    >
      {isOpen ? (
        <>
          <PanelLeft className="group-hover:hidden" />
          <PanelLeftClose className="hidden group-hover:block" />
        </>
      ) : (
        <>
          <PanelRight className="group-hover:hidden" />
          <PanelRightClose className="hidden group-hover:block" />
        </>
      )}
    </Button>
  );
}
