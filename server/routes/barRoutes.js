// server/routes/barRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making requests to Yelp API
const BarGoer = require('../models/BarGoer'); // Import the BarGoer model
const User = require('../models/User'); // <-- Import the User model (needed for saving last location)
const { isAuthenticated } = require('./authRoutes'); // Import the auth middleware


// Base URL for Yelp Fusion API
const YELP_API_BASE_URL = 'https://api.yelp.com/v3/businesses/search';

// --- Helper function to fetch bar data from Yelp ---
async function searchYelp(location) {
  const YELP_API_KEY = process.env.YELP_API_KEY; // Get API key from .env

  if (!YELP_API_KEY) {
    console.error('YELP_API_KEY is not set in environment variables.');
    // Throw an error or handle this case appropriately
    throw new Error('Yelp API key is not configured on the server.');
  }

  try {
    const response = await axios.get(YELP_API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
      params: {
        location: location, // Search location provided by the frontend
        term: 'bars', // We are specifically searching for bars
        limit: 20, // Number of results to return (adjust as needed)
        sort_by: 'distance' // Optional: sort results by distance
      },
    });
    return response.data.businesses; // Return the array of businesses
  } catch (error) {
    console.error('Error fetching from Yelp API:', error.response ? error.response.data : error.message);
    // Propagate a user-friendly error message
    throw new Error('Failed to fetch bars from Yelp.');
  }
}

// --- Bar Routes ---

// GET /api/bars/search
// Search for bars by location and include goer count from our DB
router.get('/search', async (req, res) => {
  const location = req.query.location; // Get location from query parameters

  if (!location) {
    return res.status(400).json({ message: 'Location query parameter is required.' });
  }

  try {
    // 1. Fetch bars from Yelp API using the helper function
    const yelpBars = await searchYelp(location);

    // If no bars found by Yelp, return empty list early
    if (!yelpBars || yelpBars.length === 0) {
         // *** Save last search location even if no results, if user authenticated ***
        if (req.isAuthenticated()) {
             const user = await User.findById(req.user._id);
             if (user) {
                 user.lastSearchLocation = location;
                 await user.save();
                 console.log(`Saved last search location "${location}" (no results) for user ${user.username}`);
             }
         }
        // *** END NEW LOGIC ***
        return res.status(200).json([]);
    }


    // 2. Get goer counts from our database for the returned Yelp bars
    const yelpIds = yelpBars.map(bar => bar.id); // Get all Yelp IDs from the results

    // Find all BarGoer entries whose yelpId is in our results
    // Use .lean() for plain JavaScript objects for efficiency
    const barGoers = await BarGoer.find({ yelpId: { $in: yelpIds } }).lean();

    // Create a map of yelpId to an array of goer user IDs
    const goersMap = barGoers.reduce((acc, goer) => {
      if (!acc[goer.yelpId]) {
        acc[goer.yelpId] = [];
      }
      acc[goer.yelpId].push(goer.userId.toString()); // Store userId as string for easy comparison
      return acc;
    }, {});


    // 3. Augment Yelp results with goer count and current user's status
    const barsWithGoers = yelpBars.map(bar => {
      const currentGoers = goersMap[bar.id] || []; // Get the list of user IDs going to this bar
      const goersCount = currentGoers.length; // Count of goers

      // Check if the current authenticated user's ID is in the list of goers for this bar
      const isUserGoing = req.isAuthenticated() // First, check if user is logged in
        ? currentGoers.includes(req.user._id.toString()) // Then, check if their ID is in the list
        : false; // Not going if not authenticated

      return {
        ...bar, // Include all original Yelp data
        goersCount: goersCount, // Add our goer count
        isUserGoing: isUserGoing // Add current user's going status for the frontend
      };
    });

    // *** NEW LOGIC: Save last search location if user is authenticated ***
    if (req.isAuthenticated()) {
      // Find the authenticated user by their ID
      const user = await User.findById(req.user._id);
      if (user) {
        // Update the lastSearchLocation field
        user.lastSearchLocation = location;
        // Save the user document
        await user.save();
        console.log(`Saved last search location "${location}" for user ${user.username}`);
      } else {
        console.warn('Authenticated user not found in DB after successful search.');
      }
    }
    // *** END NEW LOGIC ***


    // 4. Send the augmented results back to the frontend
    res.status(200).json(barsWithGoers);

  } catch (err) {
    console.error('Server error during bar search:', err);
    // Propagate the error message from the helper function or use a generic one
    res.status(500).json({ message: err.message || 'Failed to search for bars.' });
  }
});


// POST /api/bars/:yelpId/go
// Authenticated user indicates they are going to a bar
// Requires isAuthenticated middleware
router.post('/:yelpId/go', isAuthenticated, async (req, res) => {
  const yelpId = req.params.yelpId;
  const userId = req.user._id; // Get user ID from the authenticated user object (attached by Passport)

  try {
    // Check if the user is already going to this bar
    const existingGoer = await BarGoer.findOne({ yelpId, userId });

    if (existingGoer) {
      // User is already going, return current status and count
      const currentCount = await BarGoer.countDocuments({ yelpId });
      return res.status(200).json({ message: 'Already going.', goersCount: currentCount, isUserGoing: true });
    }

    // Create a new BarGoer entry
    const newGoer = new BarGoer({ yelpId, userId });
    await newGoer.save();

    // Get the updated goer count for this bar
    const updatedCount = await BarGoer.countDocuments({ yelpId });

    // Return the updated count and status
    res.status(201).json({ message: 'Added to goers list.', goersCount: updatedCount, isUserGoing: true });

  } catch (err) {
    console.error('Error adding goer:', err);
    // Handle potential duplicate key error if the unique index is violated unexpectedly
    if (err.code === 11000) { // MongoDB duplicate key error code
         const currentCount = await BarGoer.countDocuments({ yelpId });
         return res.status(409).json({ message: 'You are already listed as going.', goersCount: currentCount, isUserGoing: true });
    }
    res.status(500).json({ message: 'Failed to add you to goers list.' });
  }
});


// DELETE /api/bars/:yelpId/go
// Authenticated user indicates they are no longer going to a bar
// Requires isAuthenticated middleware
router.delete('/:yelpId/go', isAuthenticated, async (req, res) => {
   const yelpId = req.params.yelpId;
   const userId = req.user._id; // Get user ID from the authenticated user object

   try {
     // Find and remove the BarGoer entry for this user and bar
     const result = await BarGoer.deleteOne({ yelpId, userId });

     if (result.deletedCount === 0) {
       // Entry wasn't found, maybe the user wasn't listed as going
       const currentCount = await BarGoer.countDocuments({ yelpId });
       // Return 404 or 409, but include the current count and status
       return res.status(409).json({ message: 'You were not listed as going.', goersCount: currentCount, isUserGoing: false });
     }

     // Get the updated goer count
     const updatedCount = await BarGoer.countDocuments({ yelpId });

     // Return the updated count and status
     res.status(200).json({ message: 'Removed from goers list.', goersCount: updatedCount, isUserGoing: false });

   } catch (err) {
     console.error('Error removing goer:', err);
     res.status(500).json({ message: 'Failed to remove you from goers list.' });
   }
});


module.exports = router; // Export the router