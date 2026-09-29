import { Route, Routes } from 'react-router';

import { DashboardPage } from '../pages/dashboard/DashboardPage.tsx';
import { HabitsPage } from '../pages/habits/HabitsPage.tsx';
import { TasksDatePage } from '../pages/tasks/TasksDatePage.tsx';
import { TasksTodayRedirect } from '../pages/tasks/TasksTodayRedirect.tsx';
import { LanguageSwitcher } from '../shared/i18n/LanguageSwitcher.tsx';

export function AppRouter() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex justify-end px-5 pt-3 sm:px-12">
                <LanguageSwitcher />
            </header>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/habits/day" element={<HabitsPage />} />
                <Route path="/habits/month" element={<HabitsPage />} />
                <Route path="/habits/week" element={<HabitsPage />} />
                <Route path="/tasks" element={<TasksTodayRedirect />} />
                <Route path="/tasks/:date" element={<TasksDatePage />} />
            </Routes>
        </div>
    );
}
