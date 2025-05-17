// server/config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Import the User model

// Configure the local strategy for username and password authentication
passport.use(new LocalStrategy(
  // By default, LocalStrategy uses username and password.
  // If your User model uses a different field, specify it here:
  // { usernameField: 'email' },
  async (username, password, done) => {
    try {
      // Find the user by username in the database
      const user = await User.findOne({ username: username });

      // If user not found
      if (!user) {
        // done(error, user, info)
        // error: null (no server error)
        // user: false (authentication failed)
        // info: optional message
        return done(null, false, { message: 'Incorrect username.' });
      }

      // Compare the provided password with the stored hashed password
      // Use the comparePassword method defined in the User model
      const isMatch = await user.comparePassword(password);

      // If passwords don't match
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      // If username and password are correct, return the user
      return done(null, user);

    } catch (err) {
      // If there's a server error (e.g., database issue)
      return done(err); // Pass the error to the next middleware
    }
  }
));

// Serialize user: Determines which data of the user object should be stored in the session
// This function is called after successful authentication
passport.serializeUser((user, done) => {
  // Store the user's ID in the session. MongoDB _id is suitable.
  done(null, user.id);
});

// Deserialize user: Retrieves the user object from the database using the ID stored in the session
// This function is called on subsequent requests where a session exists
passport.deserializeUser(async (id, done) => {
  try {
    // Find the user by ID from the database
    const user = await User.findById(id);
    // Return the user object (it will be attached to req.user)
    done(null, user);
  } catch (err) {
    // If there's an error retrieving the user
    done(err, null);
  }
});

module.exports = passport; // Export the configured passport instance