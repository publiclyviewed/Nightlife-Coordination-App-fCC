// client/src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import the auth hook

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To display login errors
  const [message, setMessage] = useState(''); // To display success message

  const { login, isAuthenticated, loading } = useAuth(); // Get login function and auth state from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setMessage(''); // Clear previous messages

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      // Call the login function from AuthContext
      const result = await login(username, password);
      if (result && result.success) {
         setMessage('Logged in successfully!');
         // Clear form fields on success
         setUsername('');
         setPassword('');
         // You might want to redirect the user or show a success message here
         console.log('Login successful for user:', result.user.username);
      }
    } catch (err) {
      // The login function in context throws an error on failure
      setError(err.message || 'Login failed.');
    }
  };

  // Don't show login form if already authenticated
  if (isAuthenticated) {
      return <p>You are already logged in.</p>;
  }

  // Show loading indicator while authentication check or login is in progress
   if (loading) {
       return <div>Loading...</div>;
   }


  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>
       {/* Link to Registration form if you implement it */}
       {/* <p>Don't have an account? <button>Register</button></p> */}
    </div>
  );
};

export default Login;