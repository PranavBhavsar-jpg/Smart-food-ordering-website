const express = require("express");
const cors = require("cors");

const menuRouter = require("./routes/menu");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const aiRouter = require("./routes/ai");


function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  // Health
  app.get("/health", (req, res) => res.json({ ok: true }));

  // API routes
  app.use("/menu", menuRouter);
  app.use("/api/menu", menuRouter); // convenience alias for frontend

  app.use("/auth", authRouter);
  app.use("/orders", ordersRouter);
  app.use("/ai", aiRouter);

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

module.exports = { createApp };


