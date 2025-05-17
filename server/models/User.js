// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Import bcrypt

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure usernames are unique
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Field to store the user's last searched location
  lastSearchLocation: {
    type: String,
    trim: true,
    default: '' // Default to an empty string
  }
});

// Hash the password before saving (pre-save hook)
UserSchema.pre('save', async function(next) {
  // Only hash if the password has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // Replace the plain password with the hashed one
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

// Method to compare submitted password with the database password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  // Use bcrypt to compare the provided password with the stored hashed password
  return bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', UserSchema);

module.exports = User;