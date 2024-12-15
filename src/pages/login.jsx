import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { useUser } from '../context/user-context';
import { Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

const Login = () => {
  const { user } = useUser();

  const [isSignUp, setIsSignUp] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <Box className="auth-page">
      <Box as="main" className="auth-main" my={'auto'}>
        <Box className="auth-header">
          <h1>{isSignUp ? 'Inscription' : 'Connexion'}</h1>
        </Box>
        <Box className="auth-form-container">
          <LoginForm
            isSignUp={isSignUp}
            toggleForm={() => setIsSignUp(!isSignUp)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
