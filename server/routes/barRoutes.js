// server/routes/barRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making requests to Yelp API
const BarGoer = require('../models/BarGoer'); // Import the BarGoer model
const { isAuthenticated } = require('./authRoutes'); // Import the auth middleware

// --- Helper function to fetch bar data from Yelp ---
async function searchYelp(location) {
  const YELP_API_KEY = process.env.YELP_API_KEY; // Get API key from .env

  if (!YELP_API_KEY) {
    console.error('YELP_API_KEY is not set in environment variables.');
    // In a real app, you might want to return an error or handle this differently
    return [];
  }

  try {
    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
      params: {
        location: location, // Search location provided by the frontend
        term: 'bars', // We are specifically searching for bars
        limit: 20 // Number of results to return (adjust as needed)
      },
    });
    return response.data.businesses; // Return the array of businesses
  } catch (error) {
    console.error('Error fetching from Yelp API:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch bars from Yelp.'); // Propagate error
  }
}

// --- Routes ---

// GET /api/bars/search
// Search for bars by location and include goer count from our DB
router.get('/search', async (req, res) => {
  const location = req.query.location; // Get location from query parameters

  if (!location) {
    return res.status(400).json({ message: 'Location query parameter is required.' });
  }

  try {
    // 1. Fetch bars from Yelp API
    const yelpBars = await searchYelp(location);

    // 2. Get goer counts from our database for these bars
    const yelpIds = yelpBars.map(bar => bar.id); // Get all Yelp IDs from the results

    // Find all BarGoer entries whose yelpId is in our results
    const barGoers = await BarGoer.find({ yelpId: { $in: yelpIds } }).lean(); // Use .lean() for plain JS objects

    // Create a map of yelpId to goer count
    const goerCounts = barGoers.reduce((acc, goer) => {
      acc[goer.yelpId] = (acc[goer.yelpId] || 0) + 1;
      return acc;
    }, {});

    // 3. Augment Yelp results with goer count and current user's status
    const barsWithGoers = yelpBars.map(bar => {
      const goersCount = goerCounts[bar.id] || 0; // Get the count for this bar, default to 0
      const isUserGoing = req.isAuthenticated() // Check if user is logged in
        ? barGoers.some(goer => goer.yelpId === bar.id && goer.userId.equals(req.user._id)) // Check if current user's ID is in the goers list for this bar
        : false; // Not going if not authenticated

      return {
        ...bar, // Include all original Yelp data
        goersCount: goersCount, // Add our goer count
        isUserGoing: isUserGoing // Add current user's going status
      };
    });

    // 4. Send the augmented results back to the frontend
    res.status(200).json(barsWithGoers);

  } catch (err) {
    console.error('Server error during bar search:', err);
    res.status(500).json({ message: 'Failed to search for bars.', error: err.message });
  }
});

// POST /api/bars/:yelpId/go
// Authenticated user indicates they are going to a bar
router.post('/:yelpId/go', isAuthenticated, async (req, res) => {
  const yelpId = req.params.yelpId;
  const userId = req.user._id; // Get user ID from the authenticated user object

  try {
    // Check if the user is already going to this bar
    const existingGoer = await BarGoer.findOne({ yelpId, userId });

    if (existingGoer) {
      // User is already going, maybe return status 200 with a message or the current count
      const currentCount = await BarGoer.countDocuments({ yelpId });
      return res.status(200).json({ message: 'Already going.', goersCount: currentCount, isUserGoing: true });
    }

    // Create a new BarGoer entry
    const newGoer = new BarGoer({ yelpId, userId });
    await newGoer.save();

    // Get the updated goer count for this bar
    const updatedCount = await BarGoer.countDocuments({ yelpId });

    res.status(201).json({ message: 'Added to goers list.', goersCount: updatedCount, isUserGoing: true });

  } catch (err) {
    console.error('Error adding goer:', err);
    // Handle potential duplicate key error if the unique index is violated unexpectedly
    if (err.code === 11000) {
         const currentCount = await BarGoer.countDocuments({ yelpId });
         return res.status(409).json({ message: 'You are already listed as going.', goersCount: currentCount, isUserGoing: true });
    }
    res.status(500).json({ message: 'Failed to add you to goers list.' });
  }
});

// DELETE /api/bars/:yelpId/go
// Authenticated user indicates they are no longer going to a bar
// We use DELETE semantically here, could also be a POST to /notgo
router.delete('/:yelpId/go', isAuthenticated, async (req, res) => {
   const yelpId = req.params.yelpId;
   const userId = req.user._id; // Get user ID from the authenticated user object

   try {
     // Find and remove the BarGoer entry for this user and bar
     const result = await BarGoer.deleteOne({ yelpId, userId });

     if (result.deletedCount === 0) {
       // Entry wasn't found, maybe the user wasn't listed as going
       const currentCount = await BarGoer.countDocuments({ yelpId });
       return res.status(404).json({ message: 'You were not listed as going.', goersCount: currentCount, isUserGoing: false });
     }

     // Get the updated goer count
     const updatedCount = await BarGoer.countDocuments({ yelpId });

     res.status(200).json({ message: 'Removed from goers list.', goersCount: updatedCount, isUserGoing: false });

   } catch (err) {
     console.error('Error removing goer:', err);
     res.status(500).json({ message: 'Failed to remove you from goers list.' });
   }
});


module.exports = router; // Export the router