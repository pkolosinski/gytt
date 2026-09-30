import { Route, Routes } from 'react-router';

import { DashboardPage } from '../pages/dashboard/DashboardPage.tsx';
import { HabitsPage } from '../pages/habits/HabitsPage.tsx';
import { TasksDatePage } from '../pages/tasks/TasksDatePage.tsx';
import { TasksTodayRedirect } from '../pages/tasks/TasksTodayRedirect.tsx';
import { AppLayout } from './layout/AppLayout.tsx';

export function AppRouter() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/habits/day" element={<HabitsPage />} />
                <Route path="/habits/month" element={<HabitsPage />} />
                <Route path="/habits/week" element={<HabitsPage />} />
                <Route path="/tasks" element={<TasksTodayRedirect />} />
                <Route path="/tasks/:date" element={<TasksDatePage />} />
            </Route>
        </Routes>
    );
}
