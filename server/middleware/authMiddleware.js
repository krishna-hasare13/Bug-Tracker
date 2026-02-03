const jwt = require('jsonwebtoken');

// 1. Define the function
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token failed:', error.message);
      return res.status(401).json({ error: 'Token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
};

// 2. EXPORT IT AS AN OBJECT (Named Export)
module.exports = { protect };