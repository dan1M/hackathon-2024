import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // For routing
import Login from './pages/login'; // Your login page
import Planning from './pages/Planning'; // The new planning page
import Header from './components/header'; // Your header component
import Footer from './components/footer'; // Your footer component

const App = () => {
  return (
    <Router>
      <div>
        <Header />

        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Login />} /> 
            <Route path="/planning" element={<Planning />} /> 
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
