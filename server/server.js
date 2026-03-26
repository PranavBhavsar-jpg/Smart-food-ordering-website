require("dotenv").config();

const { createApp } = require("./app");
const { connectMongo } = require("./database/mongo");
const { seedMenuIfEmpty } = require("./seed/seedMenu");

async function main() {
  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  const mongoUri = process.env.MONGODB_URI;

  await connectMongo(mongoUri);
  const seedResult = await seedMenuIfEmpty();

  const app = createApp();
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`Seed menu: ${seedResult.seeded ? "seeded" : "skipped"} (${seedResult.count})`);
  });
}

main().catch((err) => {
  if (err?.name === "MongooseServerSelectionError") {
    console.error("MongoDB connection failed.");
    console.error(
      "Start MongoDB and ensure MONGODB_URI is correct (see server/README.md)."
    );
  }
  console.error(err);
  process.exit(1);
});


