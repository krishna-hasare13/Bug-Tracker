const express = require('express');
const router = express.Router();
const { getProjects, createProject, deleteProject } = require('../controllers/projectController');

// SAFETY CHECK: Import middleware safely
const authMiddleware = require('../middleware/authMiddleware');
// This handles if you exported it as { protect } OR just protect
const protect = authMiddleware.protect || authMiddleware;

// Debugging: If the server crashes, this tells us exactly which function is missing
if (typeof protect !== 'function') console.error("❌ ERROR: 'protect' middleware is not a function!", protect);
if (typeof getProjects !== 'function') console.error("❌ ERROR: 'getProjects' is not a function!", getProjects);
if (typeof createProject !== 'function') console.error("❌ ERROR: 'createProject' is not a function!", createProject);
if (typeof deleteProject !== 'function') console.error("❌ ERROR: 'deleteProject' is not a function!", deleteProject);

// Routes
router.get('/', protect, getProjects);
router.post('/', protect, createProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;