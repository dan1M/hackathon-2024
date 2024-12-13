import React, { useState } from "react";
import LoginForm from "../components/LoginForm";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>{isSignUp ? "Inscription" : "Connexion"}</h1>
      </div>
      <main className="auth-main">
        <div className="auth-form-container">
          <LoginForm isSignUp={isSignUp} toggleForm={() => setIsSignUp(!isSignUp)} />
        </div>
      </main>
    </div>
  );
};

export default Login;
