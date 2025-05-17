// client/src/components/BarList.jsx
import React from 'react';
import BarItem from './BarItem'; // Import BarItem

// BarList receives the array of bars and the go toggle handler
const BarList = ({ bars, onGoToggle }) => {
  return (
    <div>
      {bars.length > 0 ? (
        bars.map(bar => (
          // Pass bar data and the toggle handler to each BarItem
          <BarItem key={bar.id} bar={bar} onGoToggle={onGoToggle} />
        ))
      ) : (
         // Optional: Message when no bars to display
         <p>No bars found for this location.</p>
      )}
    </div>
  );
};

export default BarList;