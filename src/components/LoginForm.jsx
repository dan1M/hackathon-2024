// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Input from "./LoginInput";
import Button from "./LoginButton";

// eslint-disable-next-line react/prop-types
const Form = ({ isSignUp, onSubmit, toggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [role, setRole] = useState("student");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, name, birthdate, role, isSignUp });
  };

  return (
    <form onSubmit={handleSubmit}>
      {isSignUp && (
        <>
          <Input
            label="Nom"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
          />
          <Input
            label="Date de naissance"
            id="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
          <div className="auth-input-group">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Professeur</option>
            </select>
          </div>
        </>
      )}
      <Input
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
      />
      <Input
        label="Mot de passe"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Votre mot de passe"
      />
      <Button type="submit">{isSignUp ? "S'inscrire" : "Se connecter"}</Button>
      <p className="auth-toggle">
        {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <span onClick={toggleForm}>
          {isSignUp ? "Se connecter" : "S'inscrire"}
        </span>
      </p>
    </form>
  );
};

export default Form;
