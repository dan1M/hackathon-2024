// import { useEffect, useState } from 'react';
// import { supabase } from '../supabaseClient';
import Login from "./pages/login";
import "./styles/Auth.css";

const App = () => {
  return (
    <div className="auth-page">
      <Login />
    </div>
  );
};

export default App;