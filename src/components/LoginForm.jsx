// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Input from "./LoginInput";
import Button from "./LoginButton";
import { supabase } from "../../supabaseClient";

// eslint-disable-next-line react/prop-types
const LoginForm = ({ isSignUp, toggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Vérification de l'email dans la base de données
      const { data, error } = await supabase
        .from("users_hackathon")
        .select("email")
        .eq("email", email);

      if (error) {
        console.error("Erreur :", error);
        alert("Une erreur est survenue !");
        return;
      }

      if (data.length > 0) {
        alert("Connexion réussie !");
      } else {
        alert("Utilisateur non trouvé !");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      alert("Une erreur est survenue !");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
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

export default LoginForm;