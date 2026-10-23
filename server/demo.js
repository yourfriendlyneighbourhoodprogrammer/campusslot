import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import { createApp } from "./app.js";
import { initIndexes } from "./models.js";
import { seedResources, seedUser } from "./seed-data.js";
if (process.env.NODE_ENV === "production")
  throw new Error("Demo mode is local only.");
await mkdir(".data/mongo", { recursive: true });
// Persist the replica-set port alongside its database; changing it breaks restarts.
let port = 27031;
try {
  port = JSON.parse(await readFile(".data/mongo-port.json", "utf8")).port;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once("error", () =>
    reject(
      new Error(
        `Local MongoDB port ${port} is busy. Stop the other demo instance before restarting.`,
      ),
    ),
  );
  probe.listen(port, "127.0.0.1", () => probe.close(resolve));
});
await writeFile(".data/mongo-port.json", JSON.stringify({ port }));
const db = await MongoMemoryReplSet.create({
  instanceOpts: [{ dbPath: ".data/mongo", port }],
  replSet: { count: 1, storageEngine: "wiredTiger" },
});
await mongoose.connect(db.getUri("campusslot"));
await initIndexes();
await seedResources();
await seedUser(
  "Aarav Student",
  "student@campusslot.local",
  "CampusDemo2026!",
  "student",
);
await seedUser(
  "Campus Manager",
  "manager@campusslot.local",
  "CampusDemo2026!",
  "manager",
);
process.env.APP_ORIGIN = "http://localhost:4000";
const server = createApp().listen(4000, "127.0.0.1", () =>
  console.log(
    "Local sandbox: http://localhost:4000 — student@campusslot.local or manager@campusslot.local / CampusDemo2026!",
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      await db.stop({ doCleanup: false });
      process.exit(0);
    }),
  );
