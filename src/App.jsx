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

// L'import de BrowserRouter devrait être utilisé ici pour envelopper l'ensemble de l'application.
function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const { data, error } = await supabase.from('users').select();
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
        {/* Ajoute d'autres routes si nécessaire */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
export default App;

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
