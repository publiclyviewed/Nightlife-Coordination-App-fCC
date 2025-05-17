// client/src/context/AuthContext.jsx
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

  // Configure axios to send credentials (cookies) with requests globally in main.jsx
  // axios.defaults.withCredentials = true; // Should be set once in main.jsx

  // Check authentication status when the app loads
  // This effect only sets the auth state (isAuthenticated, user)
  // The search based on last location is handled in App.jsx's useEffect
  useEffect(() => {
    console.log('AuthContext useEffect: Checking auth status...');
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/user`);
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          console.log('AuthContext: User is authenticated.');
        } else {
          setUser(null);
          setIsAuthenticated(false);
           console.log('AuthContext: User is not authenticated.');
        }
      } catch (error) {
        // Network error or server error during auth check
        console.error('Error checking authentication status:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Initial check complete
        console.log('AuthContext useEffect: Auth check finished, loading set to false.');
      }
    };

    checkAuthStatus();
    // Empty dependency array means this runs only once on mount
  }, [API_BASE_URL]); // Include API_BASE_URL as dependency as it's used inside effect

  // Login function - called by the Login component
  const login = async (username, password) => {
    setLoading(true); // Indicate login process is loading
    console.log('AuthContext: Attempting login...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      if (response.data.message === 'Login successful.') {
        // Update state with authenticated user
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('AuthContext: Login successful.');
        // Return success and user data to the calling component
        return { success: true, user: response.data.user };
      }
      // Should not reach here if backend sends 200 on success
      throw new Error('Login failed: Unexpected response.');

    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
       // Throw a more specific error from the backend message if available
       throw new Error(error.response?.data?.message || 'Login failed.');
    } finally {
       setLoading(false); // Login process finished
        console.log('AuthContext: Login process finished.');
    }
  };

  // Logout function - called by the LogoutButton component
  const logout = async () => {
     setLoading(true); // Indicate logout process is loading
     console.log('AuthContext: Attempting logout...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/logout`);
       if (response.data.message === 'Logout successful.') {
         // Clear user state on successful logout
        setUser(null);
        setIsAuthenticated(false);
         console.log('AuthContext: Logout successful.');
         return { success: true };
       }
       throw new Error('Logout failed: Unexpected response.');
    } catch (error) {
      console.error('Logout error:', error.response ? error.response.data : error.message);
       // Throw a more specific error from the backend message if available
       throw new Error(error.response?.data?.message || error.message);
    } finally {
       setLoading(false); // Logout process finished
        console.log('AuthContext: Logout process finished.');
    }
  };

  // Function to fetch the last search location from the backend
  // Used by App.jsx after mount (if authenticated) and after login
  const fetchAndSearchLastLocation = async () => {
      console.log('AuthContext: Fetching last search location...');
       // This route requires authentication, handle potential 401 if called when not logged in
       if (!isAuthenticated) {
           console.warn('fetchAndSearchLastLocation called when not authenticated.');
           return ''; // Return empty string if not logged in
       }
      try {
          // Call the backend endpoint to get the last location for the *current* user
          const response = await axios.get(`${API_BASE_URL}/api/auth/user/last-location`);
          const lastLocation = response.data.lastSearchLocation;
          console.log('AuthContext: Fetched last search location:', lastLocation);
          return lastLocation || ''; // Return the location string or empty
      } catch(error) {
           console.error('Failed to fetch last location:', error.response?.data?.message || error.message);
           // Return empty string on error fetching location
           return '';
      }
  };


  const value = {
    user, // The authenticated user object { username, id }
    isAuthenticated, // Boolean indicating if user is logged in
    loading, // Boolean indicating if AuthContext is busy (initial check, login, logout)
    login, // Function to initiate login
    logout, // Function to initiate logout
    fetchAndSearchLastLocation, // Function to fetch last location from backend
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={value}>
      {/* Optionally, you could show a global loading spinner here based on `loading` state */}
      {children}
    </AuthContext.Provider>
  );
};