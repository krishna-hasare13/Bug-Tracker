const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, password, full_name } = req.body;

  try {
    // 1. Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Insert user (Role will default to 'developer' via database default)
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash, full_name }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*') // This fetches full_name AND role
      .eq('email', email)
      .single();

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // 3. Generate JWT (Include role in token for security)
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '1d' }
    );

    // 4. Send Response (FIXED HERE)
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        full_name: user.full_name, // <--- Was 'name', fixed to 'full_name'
        email: user.email,
        role: user.role            // <--- Added 'role' so RBAC works
      } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };