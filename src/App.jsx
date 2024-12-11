import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
      <h1>HACKATHON TEST</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
