// client/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Import auth components
import Login from '../components/Login';
import LogoutButton from '../components/LogoutButton';
import Register from '../components/Register'; // Import Register component

// Import bar components
import BarList from '../components/BarList';

import './App.css'; 


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// axios.defaults.withCredentials = true; // Set globally in main.jsx


function App() {
  // Get auth state, user, authLoading, login function, fetch function from context
  const { isAuthenticated, user, loading: authLoading, login, fetchAndSearchLastLocation } = useAuth();

  const [bars, setBars] = useState([]);
  const [location, setLocation] = useState(''); // State for search input
  const [searchLoading, setSearchLoading] = useState(false); // State for search loading
  const [searchError, setSearchError] = useState(''); // State for search errors

  // *** NEW STATE: To toggle between Login and Register views ***
  const [showLogin, setShowLogin] = useState(true); // true for Login, false for Register
  // *** END NEW STATE ***


  // Function to perform the bar search (using useCallback for performance, though optional here)
  const performSearch = useCallback(async (searchLocation) => {
     setSearchError('');
     setSearchLoading(true);

     if (!searchLocation) {
        setBars([]);
        setLocation('');
        setSearchLoading(false);
        return;
     }

     console.log(`Performing search for location: ${searchLocation}`);
     setLocation(searchLocation);

     try {
       const response = await axios.get(`${API_BASE_URL}/api/bars/search`, {
         params: { location: searchLocation }
       });
       setBars(response.data);

     } catch (error) {
       console.error('Error searching for bars:', error.response ? error.response.data : error.message);
       setSearchError(error.response?.data?.message || 'Failed to search for bars. Please try again.');
       setBars([]);
     } finally {
       setSearchLoading(false);
     }
  }, [API_BASE_URL]); // Add API_BASE_URL as dependency if it can change


  // Handler for the search form submission - calls performSearch
  const handleSearchSubmit = async (e) => {
     e.preventDefault();
     performSearch(location);
  };


  // Handler to update a single bar's state after a go/notgo action (no changes needed here)
  const handleBarGoToggle = (yelpId, updatedBarData) => {
      setBars(prevBars =>
          prevBars.map(bar =>
              bar.id === yelpId ? { ...bar, ...updatedBarData } : bar
          )
      );
  };


   // *** useEffect: Fetch last location and search ON INITIAL MOUNT if already authenticated ***
   // This handles cases where the user is already logged in when they open or refresh the app
   useEffect(() => {
       console.log('App useEffect: Checking if authenticated on mount...');
       // Only run this if the initial auth check is complete and user is authenticated
       // Also, check if bars is empty to avoid re-searching if state is preserved (less common with default setup)
       // Or use a flag to ensure this only runs once on mount after auth check.
       // Let's simplify: if authLoading is false (check done) and isAuthenticated is true, check for last location.
       if (!authLoading && isAuthenticated) {
           console.log('App useEffect: User authenticated, fetching last location...');
            fetchAndSearchLastLocation()
               .then(lastLocation => {
                    if (lastLocation) {
                       console.log('App useEffect: Found last location, performing search:', lastLocation);
                       performSearch(lastLocation); // Trigger search with the found location
                   } else {
                       console.log('App useEffect: No last location found.');
                   }
               })
               .catch(err => {
                   console.error('App useEffect: Error during mount fetch of last location:', err);
               });
       }
       // Dependencies: authLoading (to run *after* check), isAuthenticated (to run only if logged in),
       // fetchAndSearchLastLocation and performSearch (functions used inside)
   }, [authLoading, isAuthenticated, fetchAndSearchLastLocation, performSearch]);


   // *** Function to call after successful login from the Login component ***
   const handleLoginSuccess = async () => {
       console.log('App: Login successful. Checking for last search location...');
       // Switch back to showing login view (which will now just show "You are logged in")
       setShowLogin(true);
       // Fetch the last location for the logged-in user and trigger search
       const lastLocation = await fetchAndSearchLastLocation();
       if (lastLocation) {
           console.log('App: Found last location after login, performing search:', lastLocation);
           performSearch(lastLocation);
       } else {
           console.log('App: No last search location found after login.');
       }
   };
   // *** END NEW Function ***

   // *** NEW: Handler for successful registration ***
   const handleRegistrationSuccess = () => {
       console.log('App: Registration successful. Switching to login view.');
       // After successful registration, automatically switch to the login view
       setShowLogin(true);
   };
   // *** END NEW ***


  if (authLoading) {
     return (
        <div className="App" style={{ textAlign: 'center', marginTop: '50px' }}>
           <h2>Loading Application...</h2>
           {/* Optional: Add a simple spinner GIF or CSS animation */}
        </div>
     );
  }


  return (
    <div className="App">
      <h1>Nightlife Coordination App</h1>

      {/* Auth Section */}
      {/* If authenticated, show Welcome/Logout. If not, show Login or Register based on showLogin state */}
      {isAuthenticated ? (
         <div>
             {/* Display username if user object exists */}
             <p>Welcome, {user?.username}!</p>
             <LogoutButton />
         </div>
      ) : (
         // Show Login OR Register based on the showLogin state
         showLogin ? (
             // Pass the handleLoginSuccess and a way to switch to Register
             <Login onLoginSuccess={handleLoginSuccess} /> // Removed onSwitchToRegister from Login as button is outside
         ) : (
             // Pass the handleRegistrationSuccess and a way to switch back to Login
             <Register
                 onRegistrationSuccess={handleRegistrationSuccess}
                 onSwitchToLogin={() => setShowLogin(true)} // Pass a function to switch back to Login
             />
         )
      )}

       {/* Buttons to toggle between Login/Register views */}
       { !isAuthenticated && (
           <div style={{textAlign: 'center', marginTop: '10px'}}>
               {showLogin ? (
                   <p>Need an account? <button type="button" onClick={() => setShowLogin(false)}>Sign Up</button></p>
               ) : (
                    // Button is already in the Register component
                   null
               )}
           </div>
       )}


      <hr/> {/* Separator */}

      {/* Search Section - Always visible */}
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
       {searchError && <p className="error-message">{searchError}</p>}

       {/* Bar List Display */}
       {searchLoading ? (
           <p className="loading-message">Loading bars...</p> // Show loading indicator while searching
       ) : (
        // Render BarList if there are bars, or messages based on state
           bars.length > 0 ? (
               <BarList bars={bars} onGoToggle={handleBarGoToggle} />
           ) : (
               !searchLoading && !searchError && location && <p>No bars found for "{location}". Try a different location.</p>
               || (!searchLoading && !searchError && !location && <p>Enter a location to find bars.</p>)
           )
       )}

    </div>
  );
}

export default App;