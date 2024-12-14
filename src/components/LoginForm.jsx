// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/user-context';
import { Button, Input } from '@chakra-ui/react';

const LoginForm = () => {
  const { login } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Vérification de l'utilisateur
      const { data, error } = await supabase
        .from('users_hackathon')
        .select('email, name, role, id')
        .eq('email', email);

      if (error) {
        console.error('Erreur :', error);
        alert('Une erreur est survenue !');
        return;
      }

      if (data.length > 0) {
        const userName = data[0].name;
        login(data[0]);
        navigate('/', { state: { name: userName } });
      } else {
        alert('Utilisateur non trouvé !');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion :', err);
      alert('Une erreur est survenue !');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <Input
        label="Adresse e-mail"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse e-mail"
        className="auth-input-group"
      />
      <Input
        label="Mot de passe"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Votre mot de passe"
        className="auth-input-group"
      />
      <Button type="submit">Se connecter</Button>
    </form>
  );
};

export default LoginForm;
