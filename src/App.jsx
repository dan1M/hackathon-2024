import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Login from "./pages/login";
import "./styles/Auth.css";

const App = () => {
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
    <div className="auth-page">
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
      <Login />
    </div>
  );
};

export default App;