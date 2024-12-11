import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Login from './pages/login';
import Header from './components/header';
import Footer from './components/footer';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const { data, error } = await supabase.from('users').select();
    if (error) console.error('error', error);
    else setUsers(data);
  };

  return (
    <>
      <Header />

      <Footer />
    </>
  );
}

export default App;
