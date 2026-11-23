import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import polishLocale from '@fullcalendar/react/locales/pl';

import '@fullcalendar/react/skeleton.css';

import { cn } from '@/shared/generated/shadcn/lib/utils.ts';
import type { LocalDate } from '@/shared/lib/local-date.ts';

const plugins = [dayGridPlugin];
const locales = [polishLocale];

interface MonthCalendarProps {
  today: LocalDate;
  locale: string;
}

export function MonthCalendar({ today, locale }: MonthCalendarProps) {
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(today));

  return (
    <section aria-label={monthLabel} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <h2 className="mb-3 text-xl font-medium capitalize">{monthLabel}</h2>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card text-card-foreground">
        <FullCalendar
          plugins={plugins}
          locales={locales}
          locale={locale}
          initialView="dayGridMonth"
          initialDate={today}
          firstDay={1}
          fixedWeekCount={false}
          headerToolbar={false}
          height="100%"
          dayHeaderFormat={{ weekday: 'short' }}
          dayHeaderAlign="center"
          dayHeaderClass="min-w-0 bg-muted text-center text-xs font-medium text-muted-foreground sm:text-sm"
          dayHeaderInnerClass="py-2"
          dayCellClass={({ isOther }) =>
            cn(
              'shadow-[inset_1px_1px_var(--border)] first:shadow-[inset_0_1px_var(--border)]',
              isOther && 'bg-muted/50 text-muted-foreground',
            )
          }
          dayRowClass="min-h-14"
          dayCellTopClass="flex justify-start p-1 sm:p-2"
          dayCellTopInnerClass={({ isToday }) =>
            isToday
              ? 'inline-flex size-6 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'
              : 'inline-flex size-6 items-center justify-center text-sm'
          }
        />
      </div>
    </section>
  );
}
