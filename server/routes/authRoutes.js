// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User'); // Import the User model


// --- Helper Middleware to check if user is authenticated ---
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // If user is logged in, req.user will contain the user object
    return next(); // User is authenticated, proceed to the next middleware/route handler
  }
  // If not authenticated, send a 401 Unauthorized response
  res.status(401).json({ message: 'Unauthorized: You must be logged in to access this resource.' });
}


// --- Authentication Routes ---

// POST /api/auth/register
// Register a new user
// Optional: You might want to disable this in a production version if you don't want public registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Create new user (password hashing happens automatically via the pre-save hook in the User model)
    const newUser = new User({ username, password });
    await newUser.save();

    // Optionally, log the user in immediately after registration
    // req.login(newUser, (err) => {
    //     if (err) { return res.status(500).json({ message: 'Registration successful, but login failed.' }); }
    //     res.status(201).json({ message: 'User registered and logged in successfully.', user: { username: newUser.username, id: newUser._id } });
    // });

    // Or just return success status
    res.status(201).json({ message: 'User registered successfully.' });

  } catch (err) {
    console.error('Registration error:', err);
    // Handle specific Mongoose validation errors (e.g., unique constraint violation)
    if (err.code === 11000) { // MongoDB duplicate key error code
         return res.status(409).json({ message: 'Username already exists.' });
    }
    // Handle other errors
    res.status(500).json({ message: 'Error registering user.' });
  }
});


// POST /api/auth/login
// Login a user
// passport.authenticate handles the login logic using the 'local' strategy
router.post('/login', passport.authenticate('local'), (req, res) => {
    // If this function is reached, authentication was successful by passport.authenticate.
    // Passport attaches the authenticated user object to req.user.
    // We send a success response with user info.
    res.status(200).json({ message: 'Login successful.', user: { username: req.user.username, id: req.user._id } });
});


// GET /api/auth/logout
// Logout a user
router.get('/logout', (req, res, next) => {
  // Passport adds a logout() method to the request object
  req.logout((err) => {
    if (err) { return next(err); } // Handle potential errors during logout

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session on logout:', err);
            return res.status(500).json({ message: 'Error logging out.' });
        }
        // Clear the session cookie in the browser
        res.clearCookie('connect.sid'); // 'connect.sid' is the default cookie name for express-session
        res.status(200).json({ message: 'Logout successful.' });
    });
  });
});


// GET /api/auth/user
// Check authentication status and get current user info
// Used by frontend on mount to see if user is already logged in
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    // If authenticated, req.user contains the user object from the database (from deserializeUser)
    res.status(200).json({ isAuthenticated: true, user: { username: req.user.username, id: req.user._id } });
  } else {
    // If not authenticated
    res.status(200).json({ isAuthenticated: false, user: null });
  }
});

// GET /api/auth/user/last-location
// Get the last search location for the authenticated user
router.get('/user/last-location', isAuthenticated, async (req, res) => {
    try {
        // req.user is available because the isAuthenticated middleware passed
        // We can fetch the user again just to be safe, or rely on req.user if its schema is current
        const user = await User.findById(req.user._id); // Fetch fresh user data

        if (user) {
            // Return the last search location (or an empty string if not set)
            res.status(200).json({ lastSearchLocation: user.lastSearchLocation || '' });
        } else {
            // This case should theoretically not be hit if isAuthenticated passes,
            // but adding a fallback is good practice.
            console.warn('Authenticated user not found in DB when fetching last location.');
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        console.error('Error fetching last search location:', err);
        res.status(500).json({ message: 'Failed to get last search location.' });
    }
});


// Export the router and the isAuthenticated middleware
module.exports = {
    router: router,
    isAuthenticated: isAuthenticated
};