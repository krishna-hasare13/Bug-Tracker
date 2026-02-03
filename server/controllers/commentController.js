const supabase = require('../config/supabaseClient');

// @desc    Get comments for a ticket
// @route   GET /api/comments/:ticketId
const getComments = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(full_name)') // Join to get commenter's name
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true }); // Oldest first (like a chat)

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Add a comment
// @route   POST /api/comments
const createComment = async (req, res) => {
  const { content, ticket_id } = req.body;
  const user_id = req.user.id; // From auth middleware

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ content, ticket_id, user_id }])
      .select('*, users(full_name)') // Return with user info immediately
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getComments, createComment };