// client/src/components/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To check if already authenticated

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true; // Ensure credentials are sent


// Accept a prop to allow navigating back to login view
const Register = ({ onRegistrationSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Local loading state for registration process

  const { isAuthenticated } = useAuth(); // Get auth state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Basic client-side validation
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Example: minimum password length
         setError('Password must be at least 6 characters long.');
         return;
    }

    setLoading(true); // Start loading indicator

    try {
      // Send registration data to the backend endpoint
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        password // Send the plain password, backend hashes it
      });

      // If registration is successful (backend returns 201 or 200 with success message)
      if (response.status === 201 || response.status === 200) {
        setMessage('Registration successful! You can now log in.');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        console.log('Registration successful:', response.data.message);

        // *** Call parent prop on success ***
        if (onRegistrationSuccess) {
            onRegistrationSuccess(); // Parent might navigate to login or auto-login
        }
        // *** END NEW ***

      } else {
          // Handle unexpected successful responses
          setError('Registration failed with an unexpected response.');
      }

    } catch (err) {
      console.error('Registration error:', err.response ? err.response.data : err.message);
       // Display specific error message from backend if available
       setError(err.response?.data?.message || 'Registration failed.');
    } finally {
       setLoading(false); // Stop loading indicator
    }
  };

  // Don't show registration form if already authenticated
  if (isAuthenticated) {
      return null; // Parent component decides what to render based on isAuthenticated
  }


  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reg-username">Username:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="reg-password">Password:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
         <div>
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

       {/* Button/link to switch to login */}
       <p>Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} disabled={loading}>
              Login
          </button>
       </p>
    </div>
  );
};

export default Register;