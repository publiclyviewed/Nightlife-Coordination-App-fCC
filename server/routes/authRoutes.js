    const express = require('express');
    const router = express.Router();
    const passport = require('passport');
    const User = require('../models/User'); // Import the User model

    // --- Helper Middleware to check if user is authenticated ---

    function isAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
return next(); // User is authenticated, proceed to the next middleware/route handler
}
// If not authenticated, send a 401 Unauthorized response
res.status(401).json({ message: 'Unauthorized: You must be logged in to access this resource.' });
}

// --- Routes ---

// Register User (Optional but good practice)
// You might want to disable this in a production version if you don't want public registration
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

    // Create new user (password hashing happens in the User model pre-save hook)
    const newUser = new User({ username, password });
    await newUser.save();

    // Log the user in automatically after registration if desired, or just return success
    // For simplicity, let's just return success for now
    res.status(201).json({ message: 'User registered successfully.' });

  } catch (err) {
    console.error('Registration error:', err);
    // Mongoose validation error (e.g., unique constraint)
    if (err.code === 11000) {
         return res.status(409).json({ message: 'Username already exists.' });
    }
    res.status(500).json({ message: 'Error registering user.' });
  }
});


// Login User
router.post('/login', passport.authenticate('local'), (req, res) => {
    // If this function is called, authentication was successful.
    // `req.user` contains the authenticated user object.
    res.status(200).json({ message: 'Login successful.', user: { username: req.user.username, id: req.user._id } });
});

// Logout User
router.get('/logout', (req, res, next) => {
  // Passport adds a logout() method to the request object
  req.logout((err) => {
    if (err) { return next(err); }
    // destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Error logging out.' });
        }
        // clear the cookie
        res.clearCookie('connect.sid'); // The default session cookie name
        res.status(200).json({ message: 'Logout successful.' });
    });
  });
});


// Check Authentication Status and get User Info
// This route is used by the frontend to see if the user is logged in when the app loads
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    // If authenticated, req.user contains the user object from the database
    res.status(200).json({ isAuthenticated: true, user: { username: req.user.username, id: req.user._id } });
  } else {
    // If not authenticated
    res.status(200).json({ isAuthenticated: false, user: null });
  }
});

module.exports = {
    router: router,
    isAuthenticated: isAuthenticated // Export the middleware for use in other routes
};