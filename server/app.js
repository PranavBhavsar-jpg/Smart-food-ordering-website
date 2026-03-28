const express = require("express");
const cors = require("cors");

const menuRouter = require("./routes/menu");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const aiRouter = require("./routes/ai");

function createApp() {
  const app = express();

  // ✅ CORS (FIXED)
  app.use(
    cors({
      origin: "https://smart-food-ordering-website.vercel.app",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ Handle preflight requests
  // app.options("*", cors());

  // ✅ Body parser
  app.use(express.json({ limit: "1mb" }));

  // ✅ Health check
  app.get("/health", (req, res) => res.json({ ok: true }));

  // ✅ API Routes (FIXED with /api)
  app.use("/api/menu", menuRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/ai", aiRouter);

  // ✅ Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

module.exports = { createApp };