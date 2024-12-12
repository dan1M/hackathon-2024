import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <Link to="/homePage">Home</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/fields">Filières</Link>
        </li>
         <li>
          <Link to="/teachers_list">Professeurs</Link>
        </li> 
      </ul>
    </nav>
  );
};

export default Navbar;
