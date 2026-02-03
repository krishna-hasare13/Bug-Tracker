const express = require('express');
const { getComments, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:ticketId', protect, getComments);
router.post('/', protect, createComment);

module.exports = router;