// server/models/BarGoer.js
const mongoose = require('mongoose');

const BarGoerSchema = new mongoose.Schema({
  yelpId: {
    type: String,
    required: true,
    trim: true,
    // We might want an index here for faster lookup by yelpId
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: 'User', // Specifies that this ObjectId refers to the 'User' model
    required: true,
    // We might want an index here too, especially a compound index with yelpId
    index: true
  },
  // Optional: timestamp for when the user added themselves
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a compound index to ensure a user can only be listed once per bar
BarGoerSchema.index({ yelpId: 1, userId: 1 }, { unique: true });


const BarGoer = mongoose.model('BarGoer', BarGoerSchema);

module.exports = BarGoer;