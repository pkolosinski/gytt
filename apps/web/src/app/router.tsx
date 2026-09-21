import { Route, Routes } from 'react-router';

import { DashboardPage } from '../pages/dashboard/DashboardPage.tsx';
import { HabitsPage } from '../pages/habits/HabitsPage.tsx';
import { TasksPage } from '../pages/tasks/TasksPage.tsx';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/habits/day" element={<HabitsPage />} />
            <Route path="/habits/month" element={<HabitsPage />} />
            <Route path="/habits/week" element={<HabitsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
        </Routes>
    );
}
