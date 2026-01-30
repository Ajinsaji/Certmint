module.exports = function requireAdmin(req, res, next) {
  // authMiddleware must run first
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
};

