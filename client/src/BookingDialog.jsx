import React, { useState, useEffect } from "react";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { api, post, dateInIndia, hourLabel } from "./api";
import { Modal } from "./ui";
const categories = ["All", "Study room", "Creative space", "Equipment"];
export default function BookingDialog({
  resource,
  close,
  user,
  onAuth,
  onBooked,
}) {
  const [date, setDate] = useState(dateInIndia()),
    [slots, setSlots] = useState([]),
    [hour, setHour] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setSlots([]);
    setHour(null);
    setError("");
    api(`/resources/${resource._id}/slots?date=${date}`)
      .then((data) => {
        if (live) setSlots(data);
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [date, resource._id]);
  const selected = slots.find((s) => s.hour === hour);
  async function submit(e) {
    e.preventDefault();
    if (!user) {
      onAuth();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = new FormData(e.target);
      const b = await post("/bookings", {
        resource: resource._id,
        date,
        hour,
        purpose: data.get("purpose"),
        attendees: Number(data.get("attendees")),
        waitlist: !!selected?.occupied,
      });
      onBooked(b);
      close();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={resource.name} close={close}>
      <p className="muted">
        <MapPin size={14} /> {resource.location} · Up to {resource.capacity}{" "}
        people
      </p>
      <p>{resource.description}</p>
      <div className="notice">
        <Clock size={17} /> One-hour slots · Campus time (IST) ·{" "}
        {resource.approvalRequired
          ? "Manager approval required"
          : "Instant confirmation"}
      </div>
      <div className="date-actions">
        <button
          className="secondary"
          onClick={() => setDate(dateInIndia(new Date(Date.now() + 86400000)))}
        >
          Tomorrow
        </button>
        <button
          className="secondary"
          onClick={() =>
            setDate(dateInIndia(new Date(Date.now() + 2 * 86400000)))
          }
        >
          In two days
        </button>
      </div>
      <label>
        Choose a day
        <input
          type="date"
          value={date}
          min={dateInIndia()}
          max={dateInIndia(new Date(Date.now() + 14 * 86400000))}
          onInput={(e) => setDate(e.currentTarget.value)}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <p className="field-label">
        Choose a start time <span className="muted">/ 08:00–20:00</span>
      </p>
      {loading ? (
        <p role="status">Loading availability…</p>
      ) : (
        <div className="slots">
          {slots.map((s) => (
            <button
              key={s.hour}
              disabled={s.past}
              aria-pressed={hour === s.hour}
              className={`${hour === s.hour ? "selected" : ""} ${s.occupied ? "occupied" : ""}`}
              onClick={() => setHour(s.hour)}
            >
              {hourLabel(s.hour)}
              <small>
                {s.past ? "Passed" : s.occupied ? "Waitlist" : "Available"}
              </small>
            </button>
          ))}
        </div>
      )}
      {selected?.occupied && (
        <p className="notice">
          This slot is occupied. Join the queue; cancellations promote the
          earliest waiting request. {selected.waiting} currently waiting.
        </p>
      )}
      <form onSubmit={submit}>
        <label>
          What are you planning?
          <input
            name="purpose"
            placeholder="e.g. Design club project discussion"
            minLength={5}
            maxLength={200}
            required
          />
        </label>
        <label>
          Number of people
          <input
            name="attendees"
            type="number"
            min="1"
            max={resource.capacity}
            defaultValue="1"
            required
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button
          className="primary full"
          disabled={busy || hour === null || loading}
        >
          {busy
            ? "Saving…"
            : !user
              ? "Sign in to continue"
              : selected?.occupied
                ? "Join waitlist"
                : resource.approvalRequired
                  ? "Request this slot"
                  : "Confirm booking"}
          <ArrowRight size={16} />
        </button>
        <small>
          No payment required. You can cancel before the slot begins.
        </small>
      </form>
    </Modal>
  );
}
