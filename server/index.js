import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { initIndexes } from "./models.js";
if (!process.env.MONGODB_URI)
  throw new Error(
    "Set MONGODB_URI in .env, or run npm run demo for a local sandbox.",
  );
if (
  process.env.NODE_ENV === "production" &&
  !process.env.APP_ORIGIN?.startsWith("https://")
)
  throw new Error("APP_ORIGIN must be the public HTTPS URL.");
await mongoose.connect(process.env.MONGODB_URI, {
  dbName: "campusslot",
  serverSelectionTimeoutMS: 10000,
});
await initIndexes();
const server = createApp().listen(process.env.PORT || 4000, () =>
  console.log("CampusSlot ready on port", process.env.PORT || 4000),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
