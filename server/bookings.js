import mongoose from "mongoose";
import { Resource, Booking, Notification } from "./models.js";
import { AppError, slotTime } from "./validation.js";
async function notify(user, message, session) {
  await Notification.create([{ user, message }], { session });
}
export async function reserve(user, input) {
  const start = slotTime(input.date, input.hour);
  return mongoose.connection.transaction(async (session) => {
    // Writing this shared resource document serializes booking/queue mutations.
    const resource = await Resource.findOneAndUpdate(
      { _id: input.resource, active: true },
      { $inc: { revision: 1 } },
      { new: true, session },
    );
    if (!resource) throw new AppError(404, "Resource is unavailable.");
    if (input.attendees > resource.capacity)
      throw new AppError(400, "Group size exceeds this resource’s capacity.");
    if (
      await Booking.exists({
        user,
        resource: resource._id,
        start,
        live: true,
      }).session(session)
    )
      throw new AppError(
        409,
        "You already have a booking or waitlist entry for this slot.",
      );
    const occupied = await Booking.exists({
      resource: resource._id,
      start,
      active: true,
    }).session(session);
    if (occupied && !input.waitlist)
      throw new AppError(
        409,
        "This slot was just taken. Refresh and join its waitlist.",
      );
    const status = occupied
      ? "waitlisted"
      : resource.approvalRequired
        ? "pending"
        : "confirmed";
    const [booking] = await Booking.create(
      [
        {
          user,
          resource: resource._id,
          start,
          purpose: input.purpose,
          attendees: input.attendees,
          status,
          active: !occupied,
          live: true,
        },
      ],
      { session },
    );
    await notify(
      user,
      `${resource.name}: ${status === "waitlisted" ? "you joined the waitlist" : status === "pending" ? "request sent for approval" : "booking confirmed"}.`,
      session,
    );
    return booking;
  });
}
export async function transition(actor, id, action, note = "") {
  return mongoose.connection.transaction(async (session) => {
    const booking = await Booking.findById(id).session(session);
    if (!booking) throw new AppError(404, "Booking not found.");
    if (action === "cancel" && String(booking.user) !== String(actor._id))
      throw new AppError(403, "You can only cancel your own bookings.");
    if (action !== "cancel" && actor.role !== "manager")
      throw new AppError(403, "Manager access required.");
    if (!booking.live || +booking.start <= Date.now())
      throw new AppError(409, "This booking can no longer be changed.");
    if (action !== "cancel" && booking.status !== "pending")
      throw new AppError(409, "Only pending requests can be reviewed.");
    const resource = await Resource.findByIdAndUpdate(
      booking.resource,
      { $inc: { revision: 1 } },
      { new: true, session },
    );
    const released = booking.active && action !== "approve";
    booking.status =
      action === "approve"
        ? "confirmed"
        : action === "reject"
          ? "rejected"
          : "cancelled";
    booking.active = action === "approve";
    booking.live = action === "approve";
    booking.note = note;
    await booking.save({ session });
    await notify(
      booking.user,
      `${resource.name}: booking ${booking.status}.${note ? " " + note : ""}`,
      session,
    );
    if (released && resource.active) {
      const next = await Booking.findOne({
        resource: resource._id,
        start: booking.start,
        status: "waitlisted",
        live: true,
      })
        .sort({ createdAt: 1, _id: 1 })
        .session(session);
      if (next) {
        next.status = resource.approvalRequired ? "pending" : "confirmed";
        next.active = true;
        await next.save({ session });
        await notify(
          next.user,
          `${resource.name}: your waitlist entry is now ${next.status}.`,
          session,
        );
      }
    }
    return booking;
  });
}

// Reopening a resource also resumes its queued requests, in chronological order.
export async function setResourceActive(id, active) {
  return mongoose.connection.transaction(async (session) => {
    const resource = await Resource.findByIdAndUpdate(
      id,
      { $set: { active }, $inc: { revision: 1 } },
      { new: true, session },
    );
    if (!resource) throw new AppError(404, "Resource not found.");
    if (active) {
      const queue = await Booking.find({
        resource: id,
        status: "waitlisted",
        live: true,
        start: { $gt: new Date() },
      })
        .sort({ createdAt: 1, _id: 1 })
        .session(session);
      for (const waiting of queue) {
        if (
          await Booking.exists({
            resource: id,
            start: waiting.start,
            active: true,
          }).session(session)
        )
          continue;
        waiting.status = resource.approvalRequired ? "pending" : "confirmed";
        waiting.active = true;
        await waiting.save({ session });
        await notify(
          waiting.user,
          `${resource.name}: your waitlist entry is now ${waiting.status}.`,
          session,
        );
      }
    }
    return resource;
  });
}
