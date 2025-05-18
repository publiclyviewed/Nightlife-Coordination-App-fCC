// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport'); // Import passport config

// Import routes
const authRoutes = require('./routes/authRoutes').router; // Get the router object from authRoutes
const barRoutes = require('./routes/barRoutes'); // Import the bar routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// CORS: Configure to allow requests from your frontend origin with credentials
// IMPORTANT: Replace 'YOUR_FRONTEND_PRODUCTION_URL' with your actual Netlify/Vercel URL when deploying
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'process.env.FRONTEND_URL' : 'http://localhost:5173',
  credentials: true // This is crucial for sending cookies/sessions
}));

app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // Use the secret from your .env
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something is stored
  // Set cookie options - secure: true means cookie only sent over HTTPS (important for production)
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours cookie
  }
}));

// Passport Middleware
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Allow Passport to use express-session


// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Routes ---

// Basic Test Route (optional - you can remove this later)
app.get('/', (req, res) => {
   const authStatus = req.isAuthenticated() ? 'Authenticated' : 'Not Authenticated';
   const user = req.user ? req.user.username : 'Guest';
   res.send(`Nightlife App Backend is running! Status: ${authStatus}, User: ${user}`);
});

// Mount Authentication Routes under /api/auth
app.use('/api/auth', authRoutes);

// Mount Bar Routes under /api/bars
app.use('/api/bars', barRoutes);


// --- Error Handling Middleware (Optional but Recommended) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});