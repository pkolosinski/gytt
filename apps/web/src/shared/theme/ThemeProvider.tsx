import { createContext, useEffect, useState, type ReactNode } from 'react';

import { z } from 'zod';

export const THEMES = ['dark', 'light', 'system'] as const;

type Theme = (typeof THEMES)[number];

const themeSchema = z.enum(THEMES);

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeState>({
  theme: 'system',
  setTheme: () => {},
});

interface Props {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: Props) {
  const storageKey = 'gytt-ui-theme';

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey);

    const themeParseResult = themeSchema.safeParse(storedTheme);

    if (!themeParseResult.success) {
      console.warn(
        `Invalid theme value in localStorage: ${storedTheme}, falling back to default theme.`,
      );
      return defaultTheme;
    }
    return themeParseResult.data;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
