import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
