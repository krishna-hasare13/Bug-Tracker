const checkRole = (roles) => (req, res, next) => {
  // req.user is populated by the authMiddleware (protect)
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
  }
  next();
};

module.exports = { checkRole };