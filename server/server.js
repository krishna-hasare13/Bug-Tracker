const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const supabase = require('./config/supabaseClient'); // Optional: Only if you need it in this file

// Load env vars
dotenv.config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');

// --- 🛠️ CORS CONFIGURATION (CRITICAL UPDATE) ---
app.use(cors({
  origin: [
    'http://localhost:5173',                     // Allow your local frontend
    'https://bug-tracker-livid-nine.vercel.app'   // ⚠️ REPLACE THIS with your actual Vercel URL   
  ],
  credentials: true, // Allows sending tokens/cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

app.use(express.json()); // Allows parsing JSON bodies

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);

// --- TEMPORARY TEST ROUTE ---
app.get('/', (req, res) => {
  res.send('Bug Tracker API is running 🚀');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});