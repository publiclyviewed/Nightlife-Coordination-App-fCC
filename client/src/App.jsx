// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Keep axios for other API calls
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// Import auth components
import Login from '../components/Login';
import LogoutButton from '../components/LogoutButton';

function App() {
  const { isAuthenticated, user, loading: authLoading } = useAuth(); // Get auth state and user from context

  const [bars, setBars] = useState([]); // State to hold bar search results
  const [location, setLocation] = useState(''); // State for search input
  const [searchLoading, setSearchLoading] = useState(false); // State for search loading
  const [searchError, setSearchError] = useState(''); // State for search errors

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  axios.defaults.withCredentials = true; // Ensure credentials are sent (should be set in AuthContext too, but doesn't hurt)


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
      setBars(response.data); // Set the fetched bars
       // TODO: Implement saving last search location on backend here later if authenticated
    } catch (error) {
      console.error('Error searching for bars:', error.response ? error.response.data : error.message);
      setSearchError('Failed to search for bars. Please try again.'); // Generic error message
    } finally {
      setSearchLoading(false);
    }
  };


  // --- Placeholder for Bar Item Component ---
  // We'll replace this with a real component later
  const BarItemPlaceholder = ({ bar }) => {
      // You'll get bar data from the backend including:
      // bar.id (yelpId), bar.name, bar.location.address1, bar.image_url, etc.
      // bar.goersCount (from your DB)
      // bar.isUserGoing (from your DB, for the current authenticated user)

      const { isAuthenticated, user } = useAuth(); // Get auth state

      // Placeholder for the "Go" / "Not Going" button handler
      const handleGoToggle = async () => {
          if (!isAuthenticated) {
              alert('Please log in to mark yourself as going.');
              return;
          }
          // TODO: Implement the actual API call and state update here later
          console.log(`User ${user.username} clicked go/notgo for bar: ${bar.name}`);
           // This is where you'll call the POST or DELETE /api/bars/:yelpId/go endpoints
           // And update the bars state in the parent component to reflect the new goer count and isUserGoing status
      };


      return (
          <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{bar.name}</h3>
              <p>{bar.location?.address1}, {bar.location?.city}</p>
              <p>People going: {bar.goersCount}</p> {/* Display goer count from backend */}

              {/* Conditionally render Go/Not Going button */}
              {isAuthenticated && (
                  <button onClick={handleGoToggle}>
                      {bar.isUserGoing ? 'Not Going' : 'Go'} {/* Button text based on user status */}
                  </button>
              )}
          </div>
      );
  };
  // --- End Placeholder ---


  // Show loading state for initial auth check or search
  if (authLoading || searchLoading) {
     // You might want separate loading indicators later
     // return <div>Loading...</div>;
  }


  return (
    <div className="App">
      <h1>Nightlife Coordination App</h1>

       {/* Show Logout button if authenticated, or Login form if not */}
      {isAuthenticated ? (
         <LogoutButton />
      ) : (
         <Login />
      )}

      <hr/> {/* Separator */}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit}>
          <input
              type="text"
              placeholder="Enter location (e.g., London)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={searchLoading} // Disable input while searching
          />
          <button type="submit" disabled={searchLoading}>
               {searchLoading ? 'Searching...' : 'Search'}
           </button>
      </form>

       {/* Search Error */}
       {searchError && <p style={{ color: 'red' }}>{searchError}</p>}

       {/* Bar List (using placeholder for now) */}
       <div>
           <h2>Bars in {location || 'area'}</h2>
           {bars.length > 0 ? (
               bars.map(bar => (
                   <BarItemPlaceholder key={bar.id} bar={bar} />
               ))
           ) : (
               !searchLoading && !searchError && <p>Enter a location to find bars.</p> // Message when no results and not loading/error
           )}
       </div>


      {/* Basic message from backend check (optional, can remove) */}
       {/* <p>Backend status: {backendMessage}</p> */}


    </div>
  );
}

export default App;