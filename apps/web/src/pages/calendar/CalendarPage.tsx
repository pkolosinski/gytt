import { useTranslation } from 'react-i18next';

import { MonthCalendar } from '@/features/calendar/MonthCalendar.tsx';
import { todayLocalDate } from '@/shared/lib/local-date.ts';

export function CalendarPage() {
  const { t, i18n } = useTranslation('common');

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <h1 className="font-heading m-0 text-4xl tracking-tight">{t('sections.calendar')}</h1>
      <MonthCalendar today={todayLocalDate()} locale={i18n.resolvedLanguage ?? 'en'} />
    </div>
  );
}
