const mongoose = require("mongoose");

async function connectMongo(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Set it in server/.env");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);

  return mongoose.connection;
}

module.exports = { connectMongo };

