import type { Habit, HabitInput } from '../types/habits';

const dailyHabits: Habit[] = [
  {
    id: 1,
    name: 'Picie wody',
    goal: 2,
    completed: 1.5,
    unit: 'l',
    type: 'daily',
  },
  {
    id: 2,
    name: 'Czytanie',
    goal: 20,
    completed: 35,
    unit: 'min',
    type: 'daily',
  },
  {
    id: 3,
    name: 'Ćwiczenia',
    goal: 30,
    completed: 10,
    unit: 'min',
    type: 'daily',
  },
  {
    id: 4,
    name: 'Kroki',
    goal: 10000,
    completed: 5600,
    type: 'daily',
  },
];

const weeklyHabits: Habit[] = [
  {
    id: 1,
    name: 'Trening',
    goal: 2,
    completed: 1,
    unit: 'razy',
    type: 'weekly',
  },
];

export type HabitsByFrequency = {
  dailyHabits: Habit[];
  weeklyHabits: Habit[];
};

export const getHabits = async (): Promise<HabitsByFrequency> => {
  return Promise.resolve({ dailyHabits, weeklyHabits });
}

export const postHabit = async (habit: HabitInput) => {
  habit.type
  return Promise.resolve()
}
