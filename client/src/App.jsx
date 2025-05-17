// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Import auth components
import Login from '../components/Login';
import LogoutButton from '../components/LogoutButton';

// Import bar components
import BarList from '../components/BarList'; // Import BarList


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true; // Ensure credentials are sent


function App() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [bars, setBars] = useState([]);
  const [location, setLocation] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Handler for the search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setSearchError('');
    setBars([]); // Clear previous results
    setSearchLoading(true);

    if (!location) {
      setSearchError('Please enter a location.');
      setSearchLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/bars/search`, {
        params: { location }
      });
      setBars(response.data);

       // TODO: Implement saving last search location on backend here later IF authenticated
       // if (isAuthenticated) {
       //    await axios.post(`${API_BASE_URL}/api/user/last-location`, { location }); // Need this backend route
       // }

    } catch (error) {
      console.error('Error searching for bars:', error.response ? error.response.data : error.message);
      setSearchError('Failed to search for bars. Please try again.'); // Generic error message
    } finally {
      setSearchLoading(false);
    }
  };

  // Handler to update a single bar's state after a go/notgo action
  const handleBarGoToggle = (yelpId, updatedBarData) => {
      setBars(prevBars =>
          prevBars.map(bar =>
              bar.id === yelpId ? { ...bar, ...updatedBarData } : bar // Update the specific bar item
          )
      );
  };


  // Show loading state for initial auth check or search
  if (authLoading) {
     // Show a global loader while auth is checking on mount
     return <div>Loading application...</div>;
  }


  return (
    <div className="App">
      <h1>Nightlife Coordination App</h1>

      {/* Auth Section */}
      {isAuthenticated ? (
         <div>
             <p>Welcome, {user?.username}!</p> {/* Display username */}
             <LogoutButton />
         </div>
      ) : (
         <Login /> // Show login form if not authenticated
         // Optional: Add a link to a registration form here
      )}

      <hr/> {/* Separator */}

      {/* Search Section */}
      <h2>Find Bars</h2>
      <form onSubmit={handleSearchSubmit}>
          <input
              type="text"
              placeholder="Enter location (e.g., London)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={searchLoading}
          />
          <button type="submit" disabled={searchLoading}>
               {searchLoading ? 'Searching...' : 'Search'}
           </button>
      </form>

       {/* Search Error */}
       {searchError && <p style={{ color: 'red' }}>{searchError}</p>}

       {/* Bar List Display */}
       {searchLoading ? (
           <p>Loading bars...</p>
       ) : (
           <BarList bars={bars} onGoToggle={handleBarGoToggle} /> // Pass bars data and the update handler
       )}


      {/* Basic message from backend check (optional, can remove) */}
       {/* <p>Backend status: You are {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}. User: {user?.username || 'Guest'}</p> */}


    </div>
  );
}

export default App;