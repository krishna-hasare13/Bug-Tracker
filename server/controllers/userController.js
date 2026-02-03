const supabase = require('../config/supabaseClient');

// @desc    Get all users (for assignment dropdown)
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllUsers };