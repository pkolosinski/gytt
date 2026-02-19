import * as z from 'zod';

import { WEEKDAYS, type Weekday } from '../../types/datetime';

export type Habit = HabitInput & {
  id: number;
  completed: number;
  // progress: number;
};

export type HabitInput = {
  name: string;
  description?: string;
  goal: number;
  unit?: HabitGoalUnit | string;
  type: HabitType;
  weekdays?: Weekday[];
};

export const UNITS = ['min', 'steps', 'times'] as const;

export type HabitGoalUnit = (typeof UNITS)[number];

export const HABIT_TYPES = ['daily', 'weekly'] as const;

export type HabitType = (typeof HABIT_TYPES)[number];

export const defaultHabitInput: HabitInput = {
  name: '',
  goal: 1,
  type: 'daily',
  weekdays: [...WEEKDAYS],
};

export const habitInputSchema = z.object({
  name: z.string().max(32),
  description: z.string().max(128).optional(),
  goal: z.number().gt(0),
  unit: z.union([z.enum(UNITS), z.string().max(32)]).optional(),
  type: z.enum(HABIT_TYPES),
  weekdays: z.array(z.enum(WEEKDAYS)).optional(),
});
