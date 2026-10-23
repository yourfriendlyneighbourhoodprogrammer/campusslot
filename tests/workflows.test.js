import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createApp } from "../server/app.js";
import {
  User,
  Resource,
  Booking,
  Notification,
  initIndexes,
} from "../server/models.js";
let db, app, a, b, c, admin, room, studio;
const date = new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});
const payload = (resource, hour, waitlist = false) => ({
  resource: String(resource._id),
  date,
  hour,
  waitlist,
  attendees: 2,
  purpose: "Group project planning",
});
before(async () => {
  db = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(db.getUri("test"));
  await initIndexes();
  app = createApp();
  a = request.agent(app);
  b = request.agent(app);
  c = request.agent(app);
  admin = request.agent(app);
  for (const [agent, name] of [
    [a, "Alice"],
    [b, "Bob"],
    [c, "Cara"],
    [admin, "Manager"],
  ]) {
    const r = await agent.post("/api/auth/register").send({
      name,
      email: name.toLowerCase() + "@test.local",
      password: "TestPassword123!",
    });
    assert.equal(r.status, 201);
  }
  await User.updateOne(
    { email: "manager@test.local" },
    { $set: { role: "manager" } },
  );
  room = await Resource.create({
    name: "Test Room",
    category: "Study room",
    location: "Block A",
    description: "Quiet test room",
    capacity: 4,
    approvalRequired: false,
  });
  studio = await Resource.create({
    name: "Studio",
    category: "Creative space",
    location: "Block B",
    description: "Recording studio",
    capacity: 3,
    approvalRequired: true,
  });
});
after(async () => {
  await mongoose.disconnect();
  await db?.stop();
});
test("private routes, origin checks, and protected role assignment", async () => {
  assert.equal((await request(app).get("/api/bookings")).status, 401);
  assert.equal((await a.get("/api/manage")).status, 403);
  assert.equal(
    (
      await a
        .post("/api/bookings")
        .set("Origin", "https://evil.example")
        .send(payload(room, 8))
    ).status,
    403,
  );
  assert.equal((await a.get("/api/auth/me")).body.role, "student");
  assert.equal(
    (
      await a
        .post("/api/auth/login")
        .send({ email: "alice@test.local", password: "WrongPassword1" })
    ).status,
    401,
  );
});
test("simultaneous reservations cannot double-book", async () => {
  const results = await Promise.all(
    [a, b].map((agent) => agent.post("/api/bookings").send(payload(room, 9))),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert.equal(
    await Booking.countDocuments({ resource: room._id, active: true }),
    1,
  );
});
test("cancellation promotes FIFO waiter and updates notifications atomically", async () => {
  const booked = await a.post("/api/bookings").send(payload(room, 10));
  assert.equal(booked.status, 201);
  const waiting = await b.post("/api/bookings").send(payload(room, 10, true));
  assert.equal(waiting.body.status, "waitlisted");
  const third = await c.post("/api/bookings").send(payload(room, 10, true));
  assert.equal(third.body.status, "waitlisted");
  assert.equal(
    (await b.post(`/api/bookings/${booked.body._id}/cancel`)).status,
    403,
  );
  const cancelled = await a.post(`/api/bookings/${booked.body._id}/cancel`);
  assert.equal(cancelled.status, 200, JSON.stringify(cancelled.body));
  assert.equal((await Booking.findById(waiting.body._id)).status, "confirmed");
  assert.equal((await Booking.findById(third.body._id)).status, "waitlisted");
  assert.equal(
    (await a.post(`/api/bookings/${booked.body._id}/cancel`)).status,
    409,
  );
  assert.ok(
    await Notification.exists({
      user: waiting.body.user,
      message: /now confirmed/,
    }),
  );
});
test("approval decisions, duplicate request protection, and capacity validation", async () => {
  assert.equal(
    (
      await a
        .post("/api/bookings")
        .send({ ...payload(studio, 11), attendees: 10 })
    ).status,
    400,
  );
  const pending = await a.post("/api/bookings").send(payload(studio, 11));
  assert.equal(pending.body.status, "pending");
  assert.equal(
    (await a.post("/api/bookings").send(payload(studio, 11, true))).status,
    409,
  );
  assert.equal(
    (
      await a
        .post(`/api/manage/bookings/${pending.body._id}/approve`)
        .send({ note: "" })
    ).status,
    403,
  );
  assert.equal(
    (
      await admin
        .post(`/api/manage/bookings/${pending.body._id}/approve`)
        .send({ note: "Collect keys at the desk." })
    ).status,
    200,
  );
  assert.equal((await Booking.findById(pending.body._id)).status, "confirmed");
  assert.equal(
    (
      await admin
        .post(`/api/manage/bookings/${pending.body._id}/reject`)
        .send({ note: "No longer pending" })
    ).status,
    409,
  );
});
test("rejection promotes next request to pending, and manager may pause resources", async () => {
  const pending = await a.post("/api/bookings").send(payload(studio, 12));
  const wait = await b.post("/api/bookings").send(payload(studio, 12, true));
  assert.equal(
    (
      await admin
        .post(`/api/manage/bookings/${pending.body._id}/reject`)
        .send({ note: "Equipment maintenance" })
    ).status,
    200,
  );
  assert.equal((await Booking.findById(wait.body._id)).status, "pending");
  assert.equal(
    (
      await admin
        .patch(`/api/manage/resources/${studio._id}`)
        .send({ active: false })
    ).status,
    200,
  );
  assert.equal(
    (await c.post("/api/bookings").send(payload(studio, 13))).status,
    404,
  );
  assert.equal(
    (await request(app).get("/api/resources")).body.some(
      (r) => r._id === String(studio._id),
    ),
    false,
  );
});
test("validation, search escaping, session invalidation, and persistence", async () => {
  assert.equal(
    (
      await a
        .post("/api/bookings")
        .send({ ...payload(room, 14), date: "2020-01-01" })
    ).status,
    400,
  );
  assert.equal(
    (await a.post("/api/bookings").send({ ...payload(room, 14), hour: 22 }))
      .status,
    400,
  );
  assert.equal((await request(app).get("/api/resources?q=%5B")).status, 200);
  assert.equal((await a.get("/api/bookings")).body.length > 0, true);
  assert.equal((await a.post("/api/auth/logout")).status, 200);
  assert.equal((await a.get("/api/auth/me")).status, 401);
  assert.equal(
    (
      await a
        .post("/api/auth/login")
        .send({ email: "alice@test.local", password: "TestPassword123!" })
    ).status,
    200,
  );
  assert.equal((await a.get("/api/bookings")).body.length > 0, true);
});

test("reopening resumes paused waitlists without skipping the oldest student", async () => {
  const reservation = await a.post("/api/bookings").send(payload(room, 16));
  const waiting = await b.post("/api/bookings").send(payload(room, 16, true));
  await admin
    .patch(`/api/manage/resources/${room._id}`)
    .send({ active: false })
    .expect(200);
  await a.post(`/api/bookings/${reservation.body._id}/cancel`).expect(200);
  assert.equal((await Booking.findById(waiting.body._id)).status, "waitlisted");
  await admin
    .patch(`/api/manage/resources/${room._id}`)
    .send({ active: true })
    .expect(200);
  assert.equal((await Booking.findById(waiting.body._id)).status, "confirmed");
});
