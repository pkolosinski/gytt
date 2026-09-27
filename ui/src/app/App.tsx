import { HabitList } from '@features/habits';
import { TasksPage } from '@features/tasks';
import { Route, BrowserRouter, Routes } from 'react-router';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route index element={<HabitList />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/tasks/:date" element={<TasksPage />} />
    </Routes>
  </BrowserRouter>
);
