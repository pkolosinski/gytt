import type { Habit } from '../types/habits';

export const calculateProgress = (habit: Habit): string => {
  const progress = (habit.completed / habit.goal) * 100;
  return `${progress.toFixed(0)}%`;
};
