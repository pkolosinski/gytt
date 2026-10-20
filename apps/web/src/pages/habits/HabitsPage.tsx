import { useTranslation } from 'react-i18next';

import { Repeat2 } from 'lucide-react';

import { ModulePlaceholder } from '../../shared/components/ModulePlaceholder.tsx';

export function HabitsPage() {
  const { t } = useTranslation('habits');

  return <ModulePlaceholder description={t('description')} icon={Repeat2} title={t('title')} />;
}
