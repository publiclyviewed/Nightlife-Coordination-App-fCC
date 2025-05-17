    // server/index.js
    const express = require('express');
    const dotenv = require('dotenv');
    const cors = require('cors');
    const mongoose = require('mongoose');
    const session = require('express-session'); // Import express-session
    const passport = require('./config/passport'); // Import passport config
    const barRoutes = require('./routes/barRoutes');

    // Load environment variables
    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 5000;

    // --- Middleware ---
    // CORS: Allow requests from your frontend origin
    // In production, replace '*' with your frontend URL (e.g., 'https://your-app.netlify.app')
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' ? 'YOUR_FRONTEND_PRODUCTION_URL' : 'http://localhost:5173', // Replace with your Netlify/Vercel URL
      credentials: true // This is important for sending cookies/sessions
    }));

    app.use(express.json()); // Parse incoming JSON payloads
    app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies

    // Session Middleware
    app.use(session({
      secret: process.env.SESSION_SECRET, // Use the secret from your .env
      resave: false, // Don't save session if unmodified
      saveUninitialized: false, // Don't create session until something is stored
      cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 } // 24 hours cookie, secure in production
    }));

    // Passport Middleware
    app.use(passport.initialize()); // Initialize Passport
    app.use(passport.session()); // Allow Passport to use express-session

    // --- Database Connection ---

 mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---

// Basic Test Route (keep for now)
app.get('/', (req, res) => {
   // req.isAuthenticated() is added by passport
  const authStatus = req.isAuthenticated() ? 'Authenticated' : 'Not Authenticated';
  const user = req.user ? req.user.username : 'Guest';
  res.send(`Nightlife App Backend is running! Status: ${authStatus}, User: ${user}`);
});

// Authentication Routes (placeholder - we'll create a separate file for these)
const authRoutes = require('./routes/authRoutes').router;

app.get('/', (req, res) => {
   // req.isAuthenticated() is added by passport
  const authStatus = req.isAuthenticated() ? 'Authenticated' : 'Not Authenticated';
  const user = req.user ? req.user.username : 'Guest';
  res.send(`Nightlife App Backend is running! Status: ${authStatus}, User: ${user}`);
});


app.use('/api/auth', authRoutes);

app.use('/api/bars', barRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});