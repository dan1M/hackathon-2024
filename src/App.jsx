import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Login from './pages/login';
import Header from './components/header';
import Footer from './components/footer';
import Dashboard from './pages/dashboard';
import Navbar from './components/navbar';
import HomePage from './pages/HomePage';
import FilierePage from './pages/filiere';
import ListeTeachers from './pages/listeTeachers';
import { supabase } from "../supabaseClient";
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

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/fields" element={<FilierePage />} />
        <Route path="/teachers_list" element={<ListeTeachers />} />
        {/* Ajoute d'autres routes si nécessaire */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
export default App;

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
