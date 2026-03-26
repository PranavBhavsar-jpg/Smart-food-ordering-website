const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendRegistrationEmail } = require("../utils/email");

function signToken(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role === "admin" ? "admin" : "student",
  });

  // Send welcome email (fire and forget)
  // sendRegistrationEmail(user).catch((err) => console.error("Failed to send email", err));
  try {
    sendRegistrationEmail(user).catch(() => { });
  } catch (e) {
    console.log("Email skipped");
  }

  const token = signToken(user);
  return res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

module.exports = { register, login };

