import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Custom hook to use the AuthContext

 export const useAuth = () => {
return useContext(AuthContext);
};

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null or { username, id }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // To indicate initial auth check is in progress

  // Base URL for backend API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Configure axios to send credentials (cookies) with requests
  axios.defaults.withCredentials = true;

  // Check authentication status when the app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/user`);
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Initial check complete
      }
    };

    checkAuthStatus();
  }, []); // Empty dependency array means this runs once on mount


  // Login function
  const login = async (username, password) => {
    setLoading(true); // Indicate login process is loading
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      if (response.data.message === 'Login successful.') {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // TODO: Implement remember last search logic here later
        return { success: true, user: response.data.user }; // Return success and user data
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
       // Return error details from backend response if available
       throw new Error(error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Login failed.');
    } finally {
       setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
     setLoading(true); // Indicate logout process is loading
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/logout`);
       if (response.data.message === 'Logout successful.') {
        setUser(null);
        setIsAuthenticated(false);
         return { success: true };
       }
    } catch (error) {
      console.error('Logout error:', error.response ? error.response.data : error.message);
       throw new Error(error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Logout failed.');
    } finally {
       setLoading(false);
    }
  };

  // (Optional) Register function - implement if you want public registration
  // const register = async (username, password) => { ... };


  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    // register // include if implemented
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={value}>
      {/* Only render children once the initial auth check is done */}
      {!loading && children}
      {/* Or show a loading spinner if loading */}
      {/* {loading ? <div>Loading...</div> : children} */}
    </AuthContext.Provider>
  );
};
