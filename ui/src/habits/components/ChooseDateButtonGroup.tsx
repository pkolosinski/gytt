import { ArrowLeftIcon, ArrowRightIcon, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
  variant:
    | 'ghost'
    | 'outline'
    | 'link'
    | 'default'
    | 'destructive'
    | 'secondary';
}

export const ChooseDateButtonGroup = ({ variant }: Props) => {
  const { i18n } = useTranslation();
  const [date, setDate] = useState(new Date());

  const onSetPreviousDay = () => {
    const previousDay = new Date(date);
    previousDay.setDate(date.getDate() - 1);
    setDate(previousDay);
  };
  const onSetNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    setDate(nextDay);
  };
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
      <Button variant={variant} size="icon-lg" onClick={onSetPreviousDay}>
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
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
      <Button variant={variant} size="icon-lg" onClick={onSetNextDay}>
        <ArrowRightIcon />
      </Button>
    </ButtonGroup>
  );
};
