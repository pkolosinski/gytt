import { Button } from '@shared/components/shadcn/ui/button';
import { ButtonGroup } from '@shared/components/shadcn/ui/button-group';
import { Calendar } from '@shared/components/shadcn/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/shadcn/ui/popover';
import { ArrowLeftIcon, ArrowRightIcon, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSetDate } from '../hooks/useSetDate';

interface Props {
  variant:
    | 'ghost'
    | 'outline'
    | 'link'
    | 'default'
    | 'destructive'
    | 'secondary';
}

export const SelectDateButtonGroup = ({ variant }: Props) => {
  const { i18n } = useTranslation();
  const { date, setPreviousDay, setNextDay, selectDate } = useSetDate();

  const formatDate = (locale: string, date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString(locale, options);
  };

  return (
    <ButtonGroup className="bg-inherit">
      <Button variant={variant} size="icon-lg" onClick={setPreviousDay}>
        <ArrowLeftIcon />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={variant} size="lg" className="w-50">
            <span className="flex items-stretch gap-2">
              <CalendarDays />
              {formatDate(i18n.language, date)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            required
            mode="single"
            selected={date}
            onSelect={selectDate}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
      <Button variant={variant} size="icon-lg" onClick={setNextDay}>
        <ArrowRightIcon />
      </Button>
    </ButtonGroup>
  );
};
