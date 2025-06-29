import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Tailwind CSS ထည့်သွင်းထားသည်
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
