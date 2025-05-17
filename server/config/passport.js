    // server/config/passport.js
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const User = require('../models/User'); // Import the User model

    // Configure the local strategy for username and password authentication

 passport.use(new LocalStrategy(
async (username, password, done) => {
try {
// Find the user by username
const user = await User.findOne({ username: username });

      // If user not found
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await user.comparePassword(password); // Use the method defined in User model

      // If passwords don't match
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      // If username and password are correct, return the user
      return done(null, user);

    } catch (err) {
      return done(err); // Pass any errors
    }
  }
));

// Serialize user: Determines which data of the user object should be stored in the session
passport.serializeUser((user, done) => {
  done(null, user.id); // Store the user's ID in the session
});

// Deserialize user: Retrieves the user object from the database using the ID stored in the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Return the user object
  } catch (err) {
    done(err, null); // Pass any errors
  }
});

module.exports = passport;