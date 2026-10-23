import React, { useState, useEffect } from "react";

import { post, displayTime } from "./api";
import { Icon, Modal, Empty } from "./ui";
const categories = ["All", "Study room", "Creative space", "Equipment"];
export default function MyBookings({ bookings, onRefresh, notify }) {
  const [filter, setFilter] = useState("Upcoming"),
    [busy, setBusy] = useState(""),
    [confirm, setConfirm] = useState(null);
  const filtered = bookings.filter((b) =>
    filter === "History"
      ? !b.live || +new Date(b.start) < Date.now()
      : b.live && +new Date(b.start) >= Date.now(),
  );
  async function cancel() {
    setBusy(confirm._id);
    try {
      await post(`/bookings/${confirm._id}/cancel`);
      notify(
        "Booking cancelled. If someone was waiting, their request has been promoted.",
      );
      setConfirm(null);
      await onRefresh();
    } catch (e) {
      notify(e.message, true);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">YOUR CAMPUS PLANS</p>
          <h1>My bookings</h1>
          <p className="muted">
            Your time, all in one place. All times are IST.
          </p>
        </div>
      </div>
      <div className="tabs">
        {["Upcoming", "History"].map((f) => (
          <button
            key={f}
            className={f === filter ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      {!filtered.length ? (
        <Empty
          title="A little room for possibility."
          text="Your reservations and waitlist entries will appear here."
        />
      ) : (
        filtered.map((b) => (
          <article className="booking-row" key={b._id}>
            <div className="booking-icon">
              <Icon category={b.resource?.category} />
            </div>
            <div className="booking-info">
              <h3>{b.resource?.name || "Resource unavailable"}</h3>
              <p>
                {displayTime(b.start)} · 1 hour · {b.attendees}{" "}
                {b.attendees === 1 ? "person" : "people"}
              </p>
              <p className="muted">{b.purpose}</p>
              {b.note && <p className="notice">Manager’s note: {b.note}</p>}
            </div>
            <span className={`badge ${b.status}`}>{b.status}</span>
            {b.live && +new Date(b.start) > Date.now() && (
              <button className="secondary" onClick={() => setConfirm(b)}>
                Cancel
              </button>
            )}
          </article>
        ))
      )}
      {confirm && (
        <Modal title="Cancel this booking?" close={() => setConfirm(null)}>
          <p>
            Your reservation for {confirm.resource?.name} at{" "}
            {displayTime(confirm.start)} will be released. This cannot be
            undone.
          </p>
          <button className="primary full" onClick={cancel} disabled={!!busy}>
            {busy ? "Cancelling…" : "Yes, cancel booking"}
          </button>
        </Modal>
      )}
    </>
  );
}
