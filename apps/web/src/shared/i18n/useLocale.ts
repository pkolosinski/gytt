import { useContext } from 'react';

import { LocaleContext, type LocaleContextValue } from './locale-context.ts';

export function useLocale(): LocaleContextValue {
    const context = useContext(LocaleContext);
    if (context === null) {
        throw new Error('useLocale must be used within a LocaleProvider.');
    }
    return context;
}
