// eslint-disable-next-line no-unused-vars
import React from "react";
import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  const { name } = location.state || { name: "Utilisateur" };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Bienvenue {name} !</h1>
    </div>
  );
};

export default Home;
