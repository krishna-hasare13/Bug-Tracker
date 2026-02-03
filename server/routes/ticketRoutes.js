const express = require('express');
const router = express.Router();

// 1. IMPORT CONTROLLERS (Destructuring)
const { getTickets, createTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');

// 2. IMPORT MIDDLEWARE (Destructuring - Matches Step 1)
const { protect } = require('../middleware/authMiddleware');

// --- DEBUG BLOCK: IF SERVER CRASHES, CHECK TERMINAL FOR THESE LOGS ---
console.log("------------------------------------------------");
console.log("Checking Ticket Route Variables:");
console.log("1. protect is:", typeof protect); // Should say 'function'
console.log("2. createTicket is:", typeof createTicket); // Should say 'function'
console.log("------------------------------------------------");

if (typeof protect !== 'function' || typeof createTicket !== 'function') {
  console.error("❌ STOPPING SERVER: One of the functions above is MISSING.");
  process.exit(1); // Stop process intentionally so you see the error
}
// ---------------------------------------------------------------------

// 3. DEFINE ROUTES
router.get('/:projectId', getTickets);
router.post('/', protect, createTicket);      // <--- Crash usually happens here
router.put('/:id', protect, updateTicket);
router.delete('/:id', protect, deleteTicket);

module.exports = router;