// client/src/components/BarList.jsx
import React from 'react';
import BarItem from './BarItem'; // Import BarItem

// BarList receives the array of bars and the go toggle handler function from the parent
const BarList = ({ bars, onGoToggle }) => {
  // Ensure bars is an array before calling map
  if (!Array.isArray(bars)) {
      console.error("BarList expected an array but received:", bars);
      return <p>Error displaying bars.</p>; // Or handle error gracefully
  }

  return (
    <div>
      {bars.length > 0 ? (
        bars.map(bar => (
          // Pass bar data and the toggle handler down to each BarItem
          <BarItem key={bar.id} bar={bar} onGoToggle={onGoToggle} />
        ))
      ) : (
         // This message is now less likely to be shown here as App.jsx handles the empty state display
         null // Or <p>No bars found.</p> if App.jsx doesn't handle it
      )}
    </div>
  );
};

export default BarList;