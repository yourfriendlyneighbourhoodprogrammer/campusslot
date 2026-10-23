import mongoose from "mongoose";
import { createApp } from "../server/app.js";
import { initIndexes } from "../server/models.js";
let connection;
const app = createApp();
export default async function handler(req, res) {
  try {
    if (!connection)
      connection = mongoose
        .connect(process.env.MONGODB_URI, {
          dbName: "campusslot",
          maxPoolSize: 5,
          serverSelectionTimeoutMS: 8000,
        })
        .then(initIndexes)
        .catch((error) => {
          connection = undefined;
          throw error;
        });
    await connection;
    return app(req, res);
  } catch (error) {
    console.error("Database initialization failed:", error.name);
    res
      .status(503)
      .json({
        error:
          "The database is temporarily unavailable. Please try again shortly.",
      });
  }
}
