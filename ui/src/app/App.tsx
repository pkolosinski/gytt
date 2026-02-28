import { HabitList } from '@features/habits';
import { Route, BrowserRouter, Routes } from 'react-router';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route index element={<HabitList />} />
    </Routes>
  </BrowserRouter>
);
