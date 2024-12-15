import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import './assets/styles/Auth.css';
import DashboardLayout from './layout/DashboardLayout';
import PlanningsPage from './pages/plannings';
import AdvancedManagement from './pages/advanced-management';
import TeacherPlanning from './pages/teacher-planning';
import TeacherAvailabilities from './pages/teacher-availabilities';
import StudentPlanning from './pages/student-planning';
import { useUser } from './context/user-context';

function App() {
  const { user } = useUser();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={
              user !== null ? (
                user.role === 'teacher' ? (
                  <Navigate to="/teacher-planning" />
                ) : user.role === 'student' ? (
                  <Navigate to="/student-planning" />
                ) : (
                  <Dashboard />
                )
              ) : (
                <Dashboard />
              )
            }
          />
          <Route path="/plannings" element={<PlanningsPage />} />
          <Route path="/advanced-management" element={<AdvancedManagement />} />
          <Route path="/teacher-planning" element={<TeacherPlanning />} />
          <Route
            path="/teacher-availabilities"
            element={<TeacherAvailabilities />}
          />
          <Route path="/student-planning" element={<StudentPlanning />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
