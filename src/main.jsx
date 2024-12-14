import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import extendedTheme from './utils/chakra-theme.js';
import { UserProvider } from './context/user-context.jsx';

const theme = extendTheme(extendedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <UserProvider>
        <App />
      </UserProvider>
    </ChakraProvider>
  </StrictMode>
);
