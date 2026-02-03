const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('./config/supabaseClient');

// Load env vars
dotenv.config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing JSON bodies
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);



// --- TEMPORARY ROUTES (To test immediately) ---

// 1. Health Check
app.get('/', (req, res) => {
  res.send('Bug Tracker API is running 🚀');
});

// 2. Test DB Connection (Fetch all projects)
app.get('/api/test-projects', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});