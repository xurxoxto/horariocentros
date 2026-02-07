import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TeachersPage } from './pages/TeachersPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { GroupsPage } from './pages/GroupsPage';
import { RoomsPage } from './pages/RoomsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ConstraintsPage } from './pages/ConstraintsPage';
import { TimetablePage } from './pages/TimetablePage';
import { ReportsPage } from './pages/ReportsPage';
import { XadePage } from './pages/XadePage';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/constraints" element={<ConstraintsPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/xade" element={<XadePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
