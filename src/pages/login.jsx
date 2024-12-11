// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Form from "../components/LoginForm";
import "../styles/Auth.css";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = (formData) => {
    console.log("Form Data:", formData);
    alert(
      `${formData.isSignUp ? "Inscription" : "Connexion"} avec succès ! Voir console.`
    );
  };

  return (
    <div className="auth-page">
      <main className="auth-main">
      <div className="auth-form-container">
        <header className="auth-header">
          <h1>{isSignUp ? "Inscription" : "Connexion"}</h1>
        </header>
        <main>
          <Form
            isSignUp={isSignUp}
            onSubmit={handleAuth}
            toggleForm={() => setIsSignUp(!isSignUp)}
          />
        </main>
      </div>
      </main>
    </div>
  );
};

export default Login;
