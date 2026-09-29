import { Repeat2 } from 'lucide-react';

import { useLocale } from '@/shared/i18n/useLocale.ts';

import { ModulePlaceholder } from '../../shared/components/ModulePlaceholder.tsx';

export function HabitsPage() {
    const { t } = useLocale();

    return (
        <ModulePlaceholder
            description={t('habits.description')}
            icon={Repeat2}
            title={t('dashboard.habits.title')}
        />
    );
}
