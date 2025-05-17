// client/src/components/BarItem.jsx
import React, { useState } from 'react'; // Import useState if you need local loading state
import axios from 'axios'; // We'll need axios here for the go/notgo calls
// Assuming components/ is sibling to context/
import { useAuth } from '../context/AuthContext'; // To check auth status

// Base URL for backend API (defined again for clarity in this component)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// axios.defaults.withCredentials = true; // Should be set globally in main.jsx

// BarItem receives bar data and a function from the parent to update the state
const BarItem = ({ bar, onGoToggle }) => {
  const { isAuthenticated } = useAuth(); // Get auth state

  // Optional: Local loading state for the button click
  const [toggleLoading, setToggleLoading] = useState(false);


  const handleGoToggle = async () => {
    // Check if user is authenticated client-side before attempting action
    if (!isAuthenticated) {
      // This should ideally be handled by not showing the button or disabling it,
      // but adding a fallback alert is good practice.
      alert('Please log in to mark yourself as going.');
      return;
    }

    setToggleLoading(true); // Start local loading indicator

    try {
      let response;
      if (bar.isUserGoing) {
        // User is currently going -> click means "Not Going"
        // Call the DELETE endpoint
        response = await axios.delete(`${API_BASE_URL}/api/bars/${bar.id}/go`);
      } else {
        // User is not currently going -> click means "Go"
        // Call the POST endpoint
        response = await axios.post(`${API_BASE_URL}/api/bars/${bar.id}/go`);
      }

      // Backend should return the updated goersCount and isUserGoing status
      // Call the parent function to update the bars list state in App.jsx
      if (onGoToggle && response.data) {
          // Pass the bar ID and the *new* data received from the backend
          onGoToggle(bar.id, {
              goersCount: response.data.goersCount,
              isUserGoing: response.data.isUserGoing // Use the status returned by the backend
          });
          console.log(`Go status updated for ${bar.name}: ${response.data.message}`);
      }

    } catch (error) {
      console.error('Error toggling go status:', error.response ? error.response.data : error.message);
      // Provide user feedback on failure
      alert(`Failed to update go status: ${error.response?.data?.message || error.message}`);
       // Optional: If the update failed, you might want to revert the optimistic UI change
       // or re-fetch data, but for now, the error alert is sufficient.
    } finally {
        setToggleLoading(false); // Stop local loading indicator
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>

      {/* Bar Content Area */}
      <div style={{ flexGrow: 1, marginRight: '20px', minWidth: '200px' }}>
        <h3>{bar.name}</h3>
        {bar.location?.address1 && bar.location?.city && (
             <p>{bar.location.address1}, {bar.location.city}</p>
        )}
        {/* Add other relevant bar details from Yelp data if desired */}
        {/* e.g., Categories: bar.categories.map(cat => cat.title).join(', ') */}
        {/* e.g., Rating: bar.rating */}
      </div>

      {/* Image Area (Optional) */}
       {bar.image_url && (
            <div style={{ marginRight: '20px' }}>
                <img src={bar.image_url} alt={bar.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}/>
            </div>
       )}

       {/* Interaction Area */}
      <div style={{ textAlign: 'center', minWidth: '80px' }}>
        {/* Display goer count */}
        <p style={{ fontWeight: 'bold', fontSize: '1.2em', margin: '5px 0' }}>{bar.goersCount} Going</p>

        {/* Show the button only if authenticated */}
        {isAuthenticated ? (
          <button
            onClick={handleGoToggle}
            disabled={toggleLoading} // Disable button while the toggle API call is in progress
            style={{ padding: '8px 15px', cursor: 'pointer' }} // Basic styling
          >
            {toggleLoading ? '...' : (bar.isUserGoing ? 'Not Going' : 'Go')} {/* Button text based on user status and loading */}
          </button>
        ) : (
          // Optional: Message if not logged in
           <p style={{fontSize: '0.9em', color: '#666', margin: '5px 0'}}>Log in to go</p>
        )}
      </div>
    </div>
  );
};

export default BarItem;