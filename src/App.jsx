import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TestRooms from './utils/testRooms';

function App() {
  return (
    <>
      <h1>HACKATHON TEST</h1>
      <TestRooms />
    </>
  );
}

export default App;
