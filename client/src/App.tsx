import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './features/HomePage';
import { DashboardPage } from './features/DashboardPage';
import { TimetablePage } from './features/TimetablePage';
import { ConstraintsPage } from './features/ConstraintsPage';
import { useThemeStore } from './store';

function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Navbar />
        <Routes>
          {/* Login removed: enter the app directly */}
          <Route path="/" element={<Navigate to="/timetables" replace />} />

          {/* Keep old routes but redirect into the app */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Navigate to="/timetables" replace />} />
          <Route path="/register" element={<Navigate to="/timetables" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/timetables" element={<TimetablePage />} />
          <Route path="/constraints" element={<ConstraintsPage />} />
          <Route path="*" element={<Navigate to="/timetables" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
