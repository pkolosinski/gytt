import { Route, Routes } from 'react-router';

import { DashboardPage, HabitsPage, TasksDatePage, TasksTodayRedirect } from '@/pages';
import { MainLayout } from './layout/MainLayout.tsx';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/habits/day" element={<HabitsPage />} />
        <Route path="/habits/month" element={<HabitsPage />} />
        <Route path="/habits/week" element={<HabitsPage />} />
        <Route path="/tasks" element={<TasksTodayRedirect />} />
        <Route path="/tasks/:date" element={<TasksDatePage />} />
      </Route>
    </Routes>
  );
}
