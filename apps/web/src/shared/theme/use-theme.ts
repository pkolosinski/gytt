import { useState } from 'react';

import { applyTheme, currentTheme, type Theme } from './theme.ts';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(currentTheme);

    function toggleTheme() {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        setTheme(next);
    }

    return { theme, toggleTheme };
}
