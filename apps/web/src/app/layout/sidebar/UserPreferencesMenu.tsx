import { useTranslation } from 'react-i18next';

import { Menu as DropdownMenuPrimitive } from '@base-ui/react/menu';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Languages, Moon, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/generated/shadcn/ui/dropdown-menu.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/shared/generated/shadcn/ui/select.tsx';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/generated/shadcn/ui/sidebar.tsx';
import { LANGUAGES } from '@/shared/i18n/i18n.ts';
import { THEMES, useTheme } from '@/shared/theme/theme.tsx';

export function UserPreferencesMenu() {
  const { t } = useTranslation('sidebar');

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>{t('preferences')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <ThemeSwitch />
          <LanguageMenuItem />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ThemeSwitch() {
  const { t } = useTranslation(['common', 'sidebar']);
  const { setTheme } = useTheme();

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuPrimitive.Trigger render={<SidebarMenuButton tooltip={t('sidebar:theme')} />}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span>{t('sidebar:theme')}</span>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuContent align="end">
          {THEMES.map((theme) => (
            <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
              {t(`themes.${theme}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function LanguageMenuItem() {
  const { t, i18n } = useTranslation('sidebar');

  return (
    <SidebarMenuItem>
      <Select
        onValueChange={(value) => {
          value && i18n.changeLanguage(value);
        }}
        value={i18n.resolvedLanguage}
      >
        <SelectPrimitive.Trigger render={<SidebarMenuButton tooltip={t('language')} />}>
          <Languages />
          <span>{t('language')}</span>
        </SelectPrimitive.Trigger>
        <SelectContent alignItemWithTrigger={false} side="top">
          <SelectGroup>
            {Object.entries(LANGUAGES).map(([lang, label]) => (
              <SelectItem key={lang} value={lang}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </SidebarMenuItem>
  );
}
