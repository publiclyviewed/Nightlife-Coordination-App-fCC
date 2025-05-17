// client/src/components/Login.jsx
import React, { useState } from 'react';
// Assuming components/ is sibling to context/
import { useAuth } from '../context/AuthContext'; // Import the auth hook

// Accept onLoginSuccess prop from parent (App.jsx)
const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To display login errors
  // const [message, setMessage] = useState(''); // Can remove message, parent handles success state visually

  // Get login function and auth state from context
  // Note: `loading` from context includes loading for login, logout, and initial check
  const { login, isAuthenticated, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    // setMessage(''); // Clear previous messages

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    // Optional: Disable form while logging in if context loading state is true
    // if (loading) return;

    try {
      // Call the login function from AuthContext and await its result
      const result = await login(username, password);

      // If login is successful (context updates state internally)
      if (result && result.success) {
         // setMessage('Logged in successfully!'); // Parent handles display of login status
         // Clear form fields on success
         setUsername('');
         setPassword('');
         console.log('Login form: Login successful.');

         // *** Call the prop function provided by the parent (App.jsx) ***
         // This signals to the parent that login is complete and allows it to trigger actions like searching
         if (onLoginSuccess) {
             onLoginSuccess(result.user); // Pass the user object if the parent needs it
         }
         // *** END NEW ***
      }
      // If login fails, the login function in context will throw an error

    } catch (err) {
      // Catch the error thrown by the login function in AuthContext
      console.error('Login form: Login failed.', err.message);
      setError(err.message || 'Login failed.'); // Display the error message to the user
    }
  };

  // Don't show login form if already authenticated
  if (isAuthenticated) {
      return null; // Parent component (App.jsx) decides what to render based on isAuthenticated
  }

   // Optional: Show a loading indicator specific to the login form while context.loading is true
   // if (loading) {
   //     return <p>Loading...</p>;
   // }


  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* {message && <p style={{ color: 'green' }}>{message}</p>} */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading} // Disable input while logging in
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
            disabled={loading} // Disable input while logging in
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