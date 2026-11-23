import { Route, Routes } from 'react-router';

import { CalendarPage, DashboardPage, HabitsPage, TasksPage, TasksTodayRedirect } from '@/pages';
import { MainLayout } from './layout/MainLayout.tsx';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path="/calendar" element={<CalendarPage />} />

        <Route path="/habits/day" element={<HabitsPage />} />
        <Route path="/habits/month" element={<HabitsPage />} />
        <Route path="/habits/week" element={<HabitsPage />} />

        <Route path="tasks">
          <Route index element={<TasksTodayRedirect />} />
          <Route path=":date" element={<TasksPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
