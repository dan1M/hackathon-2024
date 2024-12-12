// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Input from "./LoginInput";
import Button from "./LoginButton";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Vérification de l'utilisateur
      const { data, error } = await supabase
        .from("users_hackathon")
        .select("email, name") 
        .eq("email", email);

      if (error) {
        console.error("Erreur :", error);
        alert("Une erreur est survenue !");
        return;
      }

      if (data.length > 0) {
        const userName = data[0].name; 
        navigate("/home", { state: { name: userName } }); 
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
      <Button type="submit">Se connecter</Button>
    </form>
  );
};

export default LoginForm;
