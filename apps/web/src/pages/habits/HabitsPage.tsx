import { Repeat2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ModulePlaceholder } from '../../shared/components/ModulePlaceholder.tsx';

export function HabitsPage() {
    const { t } = useTranslation();

    return (
        <ModulePlaceholder
            description={t('habits.description')}
            icon={Repeat2}
            title={t('habits.title')}
        />
    );
}
