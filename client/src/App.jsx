import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './App.css'; // Remove or comment out if you deleted it

function App() {
  const [message, setMessage] = useState('');

  // Fetch test message from backend
  useEffect(() => {
    // Use the environment variable for the backend URL
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Default for local dev

    axios.get(`${backendUrl}/`)
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('Error fetching message:', error);
        setMessage('Failed to connect to backend.');
      });
  }, []);

  return (
    <div>
      <h1>Nightlife Coordination App</h1>
      <p>Message from backend: {message}</p>
      {/* Rest of your app UI will go here */}
    </div>
  );
}

export default App;