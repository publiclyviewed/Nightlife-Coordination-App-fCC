// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Assuming App.jsx is in src/, adjust path if needed
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// Import auth components (assuming they are in src/components/)
import Login from '../components/Login';
import LogoutButton from '../components/LogoutButton';

// Import bar components (assuming they are in src/components/)
import BarList from '../components/BarList'; // Import BarList
import './App.css';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// axios.defaults.withCredentials = true; // Moved to main.jsx for global setting


function App() {
  // Get auth state, user, authLoading, login function, AND the new fetch function from context
  const { isAuthenticated, user, loading: authLoading, login, fetchAndSearchLastLocation } = useAuth();

  const [bars, setBars] = useState([]);
  const [location, setLocation] = useState(''); // State for search input
  const [searchLoading, setSearchLoading] = useState(false); // State for search loading
  const [searchError, setSearchError] = useState(''); // State for search errors


  // Function to perform the bar search
  // This function can be called by the search form submission AND the login success logic
  const performSearch = async (searchLocation) => {
     setSearchError('');
     // Keep existing bars while loading new results maybe? Or clear? Let's clear for simplicity.
     // setBars([]);
     setSearchLoading(true);

     if (!searchLocation) {
       // If called with empty location, just clear loading and potentially results
        setBars([]); // Clear results if location is empty
        setLocation(''); // Also clear the input field state
       setSearchLoading(false);
       return;
     }

     console.log(`Performing search for location: ${searchLocation}`);
     setLocation(searchLocation); // Update the search input field state


     try {
       const response = await axios.get(`${API_BASE_URL}/api/bars/search`, {
         params: { location: searchLocation } // Use the passed searchLocation
       });
       setBars(response.data);

        // The backend saves the last search location automatically for authenticated users
        // when the /api/bars/search route is hit.

     } catch (error) {
       console.error('Error searching for bars:', error.response ? error.response.data : error.message);
       // Use the message from the backend if available
       setSearchError(error.response?.data?.message || 'Failed to search for bars. Please try again.');
       setBars([]); // Clear bars on error
     } finally {
       setSearchLoading(false);
     }
  };

  // Handler for the search form submission - calls performSearch
  const handleSearchSubmit = async (e) => {
     e.preventDefault();
     // Use the current location state from the input field
     performSearch(location);
  };


  // Handler to update a single bar's state after a go/notgo action
  const handleBarGoToggle = (yelpId, updatedBarData) => {
      setBars(prevBars =>
          prevBars.map(bar =>
              bar.id === yelpId ? { ...bar, ...updatedBarData } : bar // Update the specific bar item with new data from backend
          )
      );
  };


   // *** NEW: useEffect to fetch last location and search ON INITIAL MOUNT if already authenticated ***
   // This handles cases where the user is already logged in when they open or refresh the app
   useEffect(() => {
       // Only run this if the initial auth check is complete and user is authenticated
       if (!authLoading && isAuthenticated && bars.length === 0) {
           console.log('User is authenticated on mount. Checking for last search location...');
            // We need to fetch the last location and then trigger a search.
            // Calling fetchAndSearchLastLocation from AuthContext handles the fetch.
            // It returns the location string.
            fetchAndSearchLastLocation()
               .then(lastLocation => {
                    if (lastLocation) {
                       console.log('Found last location on mount, performing search:', lastLocation);
                       performSearch(lastLocation); // Trigger search with the found location
                   } else {
                       console.log('No last location found on mount.');
                       // Optional: Maybe set a default location or focus search input
                   }
               })
               .catch(err => {
                   console.error('Error during mount fetch of last location:', err);
               });
       }
       // Depend on authLoading, isAuthenticated, bars (to prevent searching if results are already loaded)
   }, [authLoading, isAuthenticated, bars.length, fetchAndSearchLastLocation]); // Added fetchAndSearchLastLocation dependency


   // *** NEW Function to call after successful login from the Login component ***
   // This function is passed down to the Login component
   const handleLoginSuccess = async () => { // No need to pass user, fetchAndSearchLastLocation gets it from context/session
       console.log('Login successful. Checking for last search location...');
       // Fetch the last location for the logged-in user
       const lastLocation = await fetchAndSearchLastLocation();

       // If a last location was found, trigger a search
       if (lastLocation) {
           console.log('Found last location after login, performing search:', lastLocation);
           performSearch(lastLocation); // Trigger search with the found location
       } else {
           // If no last location, maybe set a default message or focus the search input
           console.log('No last search location found after login.');
       }
   };
   // *** END NEW Function ***


  // Show loading state for initial auth check
  if (authLoading) {
     return <div>Loading application...</div>; // Show a global loader while auth is checking on mount
  }


  return (
    <div className="App">
      <h1>Nightlife Coordination App</h1>

      {/* Auth Section */}
      {/* Render Login form if not authenticated, or Welcome/Logout if authenticated */}
      {isAuthenticated ? (
         <div>
             {/* Display username if user object exists */}
             <p>Welcome, {user?.username}!</p>
             <LogoutButton />
         </div>
      ) : (
         // Pass the handleLoginSuccess function to the Login component
         <Login onLoginSuccess={handleLoginSuccess} /> // Pass the new prop
         // Optional: Add a link to a registration form here if implemented
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
              disabled={searchLoading} // Disable input while searching
          />
          <button type="submit" disabled={searchLoading}>
               {searchLoading ? 'Searching...' : 'Search'}
           </button>
      </form>

       {/* Search Error */}
       {searchError && <p style={{ color: 'red' }}>{searchError}</p>}

       {/* Bar List Display */}
       {searchLoading ? (
           <p>Loading bars...</p> // Show loading indicator while searching
       ) : (
            // Render BarList only if there are bars to display or no search performed yet
           bars.length > 0 ? (
               <BarList bars={bars} onGoToggle={handleBarGoToggle} />
           ) : (
               // Message when no results and not loading/error, and location is set (meaning search ran)
               !searchLoading && !searchError && location && <p>No bars found for "{location}". Try a different location.</p>
               // Message when no results, not loading/error, and no location set (initial state)
               || (!searchLoading && !searchError && !location && <p>Enter a location to find bars.</p>)
           )
       )}

    </div>
  );
}

export default App;