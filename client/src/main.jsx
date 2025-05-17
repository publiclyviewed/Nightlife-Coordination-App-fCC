// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import './index.css'; // Uncomment if you keep/add global styles
import { AuthProvider } from '../context/AuthContext.jsx'; // Import AuthProvider

// Base setup for axios to include cookies (credentials) in cross-origin requests
import axios from 'axios';
axios.defaults.withCredentials = true;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App component with AuthProvider */}
    <AuthProvider>
       <App />
    </AuthProvider>
  </React.StrictMode>,
);