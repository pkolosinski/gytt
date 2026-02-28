import { useCallback, useState } from 'react';

export function useSetDate(): {
  date: Date;
  setPreviousDay: () => void;
  setNextDay: () => void;
  selectDate: (val: Date) => void;
} {
  const [date, setDate] = useState(new Date());

  const setPreviousDay = useCallback(() => {
    const previousDay = new Date(date);
    previousDay.setDate(date.getDate() - 1);
    setDate(previousDay);
  }, [date]);
  const setNextDay = useCallback(() => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    setDate(nextDay);
  }, [date]);

  return { date, setPreviousDay, setNextDay, selectDate: setDate };
}
