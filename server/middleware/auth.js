const jwt = require("jsonwebtoken");
const User = require("../models/User");

function requireAuth(roles = []) {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

      if (!token) {
        return res.status(401).json({ error: "Missing auth token" });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");

      const user = await User.findById(payload.sub).lean();
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      req.user = { id: user._id.toString(), role: user.role, name: user.name, email: user.email };
      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = { requireAuth };

