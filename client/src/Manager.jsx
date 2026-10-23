import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { api, post, displayTime } from "./api";
import { Icon, Modal, Empty } from "./ui";
const categories = ["All", "Study room", "Creative space", "Equipment"];
export default function Manager({ notify }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [review, setReview] = useState(null),
    [adding, setAdding] = useState(false),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("/manage")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  async function decide(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await post(`/manage/bookings/${review.booking._id}/${review.action}`, {
        note: new FormData(e.target).get("note"),
      });
      setReview(null);
      notify("Request updated.");
      await load();
    } catch (e) {
      notify(e.message, true);
    } finally {
      setBusy(false);
    }
  }
  async function add(e) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.target);
    try {
      await post("/manage/resources", {
        name: f.get("name"),
        category: f.get("category"),
        location: f.get("location"),
        description: f.get("description"),
        capacity: Number(f.get("capacity")),
        features: f
          .get("features")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        approvalRequired: f.get("approval") === "on",
      });
      setAdding(false);
      notify("Resource added.");
      await load();
    } catch (e) {
      notify(e.message, true);
    } finally {
      setBusy(false);
    }
  }
  async function toggle(r) {
    setBusy(true);
    try {
      await api(`/manage/resources/${r._id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !r.active }),
      });
      await load();
      notify(
        r.active ? "Resource paused for new bookings." : "Resource reopened.",
      );
    } catch (e) {
      notify(e.message, true);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return <p role="status">{error || "Loading manager workspace…"}</p>;
  const pending = data.bookings.filter(
    (b) => b.status === "pending" && +new Date(b.start) > Date.now(),
  );
  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">MANAGER WORKSPACE</p>
          <h1>A well-run campus.</h1>
          <p className="muted">
            Review requests and keep shared resources available.
          </p>
        </div>
        <button className="primary" onClick={() => setAdding(true)}>
          <Plus size={17} />
          Add resource
        </button>
      </div>
      <div className="stats">
        <div>
          <strong>{pending.length}</strong>
          <span>Awaiting review</span>
        </div>
        <div>
          <strong>{data.resources.filter((r) => r.active).length}</strong>
          <span>Active resources</span>
        </div>
        <div>
          <strong>
            {data.bookings.filter((b) => b.status === "confirmed").length}
          </strong>
          <span>Confirmed reservations</span>
        </div>
      </div>
      <h2>Pending requests</h2>
      {!pending.length ? (
        <Empty
          title="You're all caught up."
          text="New approval requests will appear here."
        />
      ) : (
        pending.map((b) => (
          <article className="booking-row" key={b._id}>
            <div className="booking-info">
              <h3>{b.resource?.name}</h3>
              <p>
                {b.user?.name} · {displayTime(b.start)} · {b.attendees} people
              </p>
              <p className="muted">{b.purpose}</p>
            </div>
            <button
              className="secondary"
              onClick={() => setReview({ booking: b, action: "reject" })}
            >
              Decline
            </button>
            <button
              className="primary"
              onClick={() => setReview({ booking: b, action: "approve" })}
            >
              Approve
            </button>
          </article>
        ))
      )}
      <h2 className="spaced">Resource directory</h2>
      <p className="muted">
        Pausing stops new reservations. Existing reservations remain valid.
      </p>
      {data.resources.map((r) => (
        <article className="booking-row" key={r._id}>
          <div className="booking-icon">
            <Icon category={r.category} />
          </div>
          <div className="booking-info">
            <h3>{r.name}</h3>
            <p>{r.location}</p>
          </div>
          <span className="badge">{r.active ? "Open" : "Paused"}</span>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => toggle(r)}
          >
            {r.active ? "Pause" : "Reopen"}
          </button>
        </article>
      ))}
      {review && (
        <Modal
          title={
            review.action === "approve" ? "Approve request" : "Decline request"
          }
          close={() => setReview(null)}
        >
          <p>
            {review.booking.user?.name} · {review.booking.resource?.name}
          </p>
          <form onSubmit={decide}>
            <label>
              Note to the student
              <textarea
                name="note"
                maxLength={200}
                minLength={review.action === "reject" ? 3 : 0}
                required={review.action === "reject"}
                placeholder={
                  review.action === "reject"
                    ? "Explain why this request is being declined"
                    : "Optional pickup or access instructions"
                }
              />
            </label>
            <button className="primary full" disabled={busy}>
              {busy ? "Saving…" : "Confirm decision"}
            </button>
          </form>
        </Modal>
      )}
      {adding && (
        <Modal title="Add a campus resource" close={() => setAdding(false)}>
          <form onSubmit={add}>
            <label>
              Name
              <input name="name" required minLength={3} maxLength={70} />
            </label>
            <label>
              Category
              <select name="category">
                {categories.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Location
              <input name="location" required minLength={2} maxLength={80} />
            </label>
            <label>
              Description
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={500}
              />
            </label>
            <label>
              Capacity
              <input
                name="capacity"
                type="number"
                min="1"
                max="100"
                defaultValue="4"
                required
              />
            </label>
            <label>
              Features, separated by commas
              <input name="features" placeholder="Wi-Fi, Whiteboard" />
            </label>
            <label className="check-label">
              <input name="approval" type="checkbox" />
              Require manager approval
            </label>
            <button className="primary full" disabled={busy}>
              {busy ? "Adding…" : "Create resource"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
