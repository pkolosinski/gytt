import { StrictMode } from 'react';

import './index.css';
import { createRoot } from 'react-dom/client';

import './app/i18n';
import { BrowserRouter, Route, Routes } from 'react-router';

import { HabitList } from './features/habits/components/HabitList';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<HabitList />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
