import { Route, Routes } from 'react-router';

import { DashboardPage } from '../pages/dashboard/DashboardPage.tsx';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
        </Routes>
    );
}
