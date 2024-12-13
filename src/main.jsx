import { StrictMode } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import extendedTheme from './utils/chakra-theme.js';

const theme = extendTheme(extendedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </StrictMode>
);
