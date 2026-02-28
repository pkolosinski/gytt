import { useEffect, useState } from 'react';

import { getHabits, type HabitsByFrequency } from '../api/habits';

export function useHabits(): HabitsByFrequency {
  const [data, setData] = useState<HabitsByFrequency>({
    dailyHabits: [],
    weeklyHabits: [],
  });

  useEffect(() => {
    const fetchHabits = async () => setData(await getHabits());
    fetchHabits();
  }, []);

  return data;
}
