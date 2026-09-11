export type Theme = 'light' | 'dark';

const darkThemeClass = 'dark';

export function systemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function currentTheme(): Theme {
    return document.documentElement.classList.contains(darkThemeClass) ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle(darkThemeClass, theme === 'dark');
}
