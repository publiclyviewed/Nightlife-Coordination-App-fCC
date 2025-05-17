// client/src/components/LogoutButton.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import the auth hook

const LogoutButton = () => {
  const { logout, isAuthenticated, loading, user } = useAuth(); // Get logout function and auth state

  const handleLogout = async () => {
    try {
      const result = await logout();
       if(result && result.success) {
         console.log('Logout successful');
         // You might want to redirect the user or show a message
       }
    } catch (err) {
      console.error('Logout failed:', err.message);
      alert(`Logout failed: ${err.message}`); // Simple alert for error
    }
  };

  // Only show the logout button if authenticated
  if (!isAuthenticated) {
    return null;
  }

   // Optional: Show user's name and loading state
  return (
    <div>
      {user && <p>Logged in as: {user.username}</p>}
      <button onClick={handleLogout} disabled={loading}>
         {loading ? 'Logging Out...' : 'Logout'}
      </button>
    </div>
  );
};

export default LogoutButton;