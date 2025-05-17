// client/src/components/LogoutButton.jsx
import React from 'react';
// Assuming components/ is sibling to context/
import { useAuth } from '../context/AuthContext'; // Import the auth hook

const LogoutButton = () => {
  // Get logout function and auth state from context
  // Note: `loading` from context includes loading for login, logout, and initial check
  const { logout, isAuthenticated, loading, user } = useAuth();

  const handleLogout = async () => {
    // Optional: Disable button while logging out if context loading state is true
    // if (loading) return;

    try {
      const result = await logout(); // Call the logout function from AuthContext
       if(result && result.success) {
         console.log('Logout successful');
         // State update happens in AuthContext, no need to do it here
         // You might want to redirect the user or show a message
       }
    } catch (err) {
      console.error('Logout failed:', err.message);
      alert(`Logout failed: ${err.message}`); // Simple alert for error
    }
  };

  // Only show the logout button if isAuthenticated is true
  if (!isAuthenticated) {
    return null; // Parent component (App.jsx) decides what to render
  }

   // Optional: Show loading indicator specific to the logout button
  // if (loading) {
  //     return <p>Logging Out...</p>;
  // }


  return (
    // Optional: Show user's name next to logout button
    // <div>
    //   {user && <p>Logged in as: {user.username}</p>}
       <button onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging Out...' : 'Logout'}
       </button>
    // </div>
  );
};

export default LogoutButton;