import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Planning from './pages/Planning';
import Dashboard from './pages/dashboard';
import HomePage from './pages/HomePage';
import FilierePage from './pages/filiere';
import ListeTeachers from './pages/listeTeachers';
<<<<<<< HEAD
import './assets/styles/Auth.css';
import DashboardLayout from './layout/DashboardLayout';
=======
import "./styles/Auth.css";

const App = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const { data, error } = await supabase.from('users_hackathon').select();
    if (error) 
      console.error('error', error);
    else setUsers(data);
  };
>>>>>>> 7accb35 (Update)

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
<<<<<<< HEAD
};

export default App;
=======
}

export default App;
>>>>>>> 7accb35 (Update)
