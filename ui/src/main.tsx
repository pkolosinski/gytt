import { createRoot } from 'react-dom/client';

import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';

import { Habits } from './habits/Habits';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<Habits />} />
    </Routes>
  </BrowserRouter>
);
