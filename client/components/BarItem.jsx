// client/src/components/BarItem.jsx
import React from 'react';
import axios from 'axios'; // We'll need axios here for the go/notgo calls
import { useAuth } from '../context/AuthContext'; // To check auth status

// Base URL for backend API (defined again for clarity in this component)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true; // Ensure credentials are sent

// BarItem receives bar data and a function to update the state in the parent
const BarItem = ({ bar, onGoToggle }) => {
  const { isAuthenticated } = useAuth(); // Get auth state

  const handleGoToggle = async () => {
    if (!isAuthenticated) {
      // This should ideally be handled by not showing the button,
      // but adding a fallback alert is good practice.
      alert('Please log in to mark yourself as going.');
      return;
    }

    try {
      let response;
      if (bar.isUserGoing) {
        // User is currently going -> click means "Not Going"
        response = await axios.delete(`<span class="math-inline">\{API\_BASE\_URL\}/api/bars/</span>{bar.id}/go`);
      } else {
        // User is not currently going -> click means "Go"
        response = await axios.post(`<span class="math-inline">\{API\_BASE\_URL\}/api/bars/</span>{bar.id}/go`);
      }

      // Call the parent function to update the bars list state
      // Pass the bar ID and the new data from the backend response
      // The backend response should contain the updated goersCount and isUserGoing status
      if (onGoToggle && response.data) {
          onGoToggle(bar.id, response.data);
      }

    } catch (error) {
      console.error('Error toggling go status:', error.response ? error.response.data : error.message);
      // Provide user feedback on failure
      alert(`Failed to update go status: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ flexGrow: 1 }}> {/* Content area */}
        <h3>{bar.name}</h3>
        {bar.location?.address1 && <p>{bar.location.address1}</p>}
        {bar.location?.city && <p>{bar.location.city}</p>}
        {/* Add image if available */}
        {bar.image_url && (
             <img src={bar.image_url} alt={bar.name} style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px' }}/>
        )}
      </div>
       {/* Interaction area */}
      <div style={{ textAlign: 'center', marginLeft: '20px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{bar.goersCount} Going</p>

        {/* Show the button only if authenticated */}
        {isAuthenticated ? (
          <button onClick={handleGoToggle} disabled={false /* Add loading state if needed */}>
            {bar.isUserGoing ? 'Not Going' : 'Go'}
          </button>
        ) : (
          // Optional: Message if not logged in
           <p style={{fontSize: '0.9em', color: '#666'}}>Log in to go</p>
        )}
      </div>
    </div>
  );
};

export default BarItem;