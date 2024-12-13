import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Planning from './pages/Planning';
import Dashboard from './pages/dashboard';
import HomePage from './pages/HomePage';
import FilierePage from './pages/filiere';
import ListeTeachers from './pages/listeTeachers';
import './assets/styles/Auth.css';
import DashboardLayout from './layout/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/homePage" element={<HomePage />} />
          <Route path="/fields" element={<FilierePage />} />
          <Route path="/teachers_list" element={<ListeTeachers />} />
          <Route path="/planning" element={<Planning />} />
          {/* Ajoute d'autres routes si nécessaire */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
