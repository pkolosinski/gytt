import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Languages, Moon, Sun } from 'lucide-react';

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
import { ThemeContext, THEMES } from '@/shared/theme/ThemeProvider.tsx';

export function UserPreferencesMenu() {
  const { t } = useTranslation('sidebar');

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>{t('preferences')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <ColorModeSwitch />
          <LanguageMenuItem />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ColorModeSwitch() {
  const { t } = useTranslation(['common', 'sidebar']);
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <SidebarMenuItem>
      <Select
        onValueChange={(value) => {
          value && setTheme(value);
        }}
        value={theme}
      >
        <SelectPrimitive.Trigger render={<SidebarMenuButton tooltip={t('sidebar:theme')} />}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span>{t('sidebar:theme')}</span>
        </SelectPrimitive.Trigger>
        <SelectContent alignItemWithTrigger={false} side="top">
          <SelectGroup>
            {THEMES.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`themes.${item}`)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
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
