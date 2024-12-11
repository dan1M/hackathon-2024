import { useEffect, useState } from 'react';
import { supabase } from './utils/supabaseClient';
import Header from './components/header';
import Footer from './components/footer';
import { generateClassAvailabilities } from './utils/generate-class-availabilities';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const { data, error } = await supabase.from('users_hackathon').select();
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
