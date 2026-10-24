import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Search,
  ArrowRight,
  Clock,
  Grid2X2,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { api, post, displayTime } from "./api";
import { createRoot } from "react-dom/client";
import { Empty } from "./ui";
import "./style.css";
import Auth from "./Auth";
import BookingDialog from "./BookingDialog";
import ResourceCard from "./ResourceCard";
import MyBookings from "./MyBookings";
import Manager from "./Manager";
const categories = ["All", "Study room", "Creative space", "Equipment"];
function App() {
  const [user, setUser] = useState(null),
    [authReady, setAuthReady] = useState(false),
    [page, setPage] = useState("Explore"),
    [resources, setResources] = useState([]),
    [bookings, setBookings] = useState([]),
    [notifications, setNotifications] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [category, setCategory] = useState("All"),
    [q, setQ] = useState(""),
    [selected, setSelected] = useState(null),
    [showAuth, setShowAuth] = useState(false),
    [toast, setToast] = useState(null);
  function notify(message, error = false) {
    setToast({ message, error });
  }
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => {})
      .finally(() => setAuthReady(true));
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(
      () =>
        api(
          `/resources?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}`,
        )
          .then((d) => {
            if (live) setResources(d);
          })
          .catch((e) => {
            if (live) setError(e.message);
          })
          .finally(() => {
            if (live) setLoading(false);
          }),
      200,
    );
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [category, q, page, retry]);
  async function refresh() {
    if (user) {
      try {
        const [b, n] = await Promise.all([
          api("/bookings"),
          api("/notifications"),
        ]);
        setBookings(b);
        setNotifications(n);
      } catch (e) {
        notify(e.message, true);
      }
    }
  }
  useEffect(() => {
    refresh();
  }, [user, page]);
  const upcoming = bookings.filter(
    (b) => b.live && new Date(b.start) > new Date(),
  );
  const unread = notifications.filter((n) => !n.read).length;
  function navigate(p) {
    if (p !== "Explore" && !user) {
      setShowAuth(true);
      return;
    }
    setPage(p);
  }
  async function signOut() {
    try {
      await post("/auth/logout");
      setUser(null);
      setBookings([]);
      setNotifications([]);
      setPage("Explore");
    } catch (e) {
      notify(e.message, true);
    }
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setPage("Explore");
          }}
        >
          <span className="brand-mark">
            <CalendarDays size={24} />
          </span>
          campus<span className="brand-light">slot</span>
          <span className="brand-dot">.</span>
        </a>
        <p className="sidebar-label">YOUR CAMPUS, SHARED</p>
        <nav>
          {[
            [Grid2X2, "Explore"],
            [Bookmark, "My bookings"],
            [Bell, "Updates"],
            ...(user?.role === "manager" ? [[Settings, "Manage"]] : []),
          ].map(([I, label]) => (
            <button
              key={label}
              className={page === label ? "nav-active" : ""}
              onClick={() => navigate(label)}
            >
              <I size={19} />
              {label}
              {label === "Updates" && unread > 0 && (
                <span className="count">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Leaf size={22} />
          <strong>
            Good spaces.
            <br />
            Great possibilities.
          </strong>
          <p>
            A little less coordination.
            <br />A little more creating.
          </p>
        </div>
        <div className="profile">
          {user ? (
            <>
              <span className="avatar">{user.name[0]}</span>
              <div>
                <strong>{user.name}</strong>
                <small>
                  {user.role === "manager"
                    ? "Resource manager"
                    : "Student account"}
                </small>
              </div>
              <button
                onClick={signOut}
                className="icon-button"
                aria-label="Sign out"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <button
              className="primary full"
              disabled={!authReady}
              onClick={() => setShowAuth(true)}
            >
              Sign in
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Campus resources <ChevronRight size={14} /> <strong>{page}</strong>
          </span>
          <span className="semester">
            <span /> Built for campus life
          </span>
        </header>
        <main>
          {page === "Explore" ? (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <p className="eyebrow">MORE SPACE FOR WHAT'S NEXT</p>
                  <h1>
                    Your next idea
                    <br />
                    needs a little room.
                  </h1>
                  <p>
                    Find a quiet corner, bring your team together,
                    <br className="desktop" /> or borrow the gear to make
                    something great.
                  </p>
                  <button
                    className="hero-link"
                    onClick={() =>
                      document
                        .getElementById("directory")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Find your space <ArrowRight size={18} />
                  </button>
                </div>
                <div className="hero-art">
                  <img
                    src="/images/study-room.webp"
                    alt="Illustrative sunlit campus study room with green chairs and a shared table"
                    width="1536"
                    height="1024"
                    fetchPriority="high"
                  />
                  <div className="hero-photo-caption">
                    <span className="photo-dot" /> A space to start something.
                  </div>
                </div>
              </section>
              <div className="summary-strip">
                <span>
                  <ShieldCheck size={18} /> Fair access for everyone
                </span>
                <span>
                  <Clock size={18} /> Simple one-hour bookings
                </span>
                <span>
                  <CalendarDays size={18} /> Plan up to 14 days ahead
                </span>
              </div>
              {user && upcoming.length > 0 && (
                <button
                  className="upcoming"
                  onClick={() => setPage("My bookings")}
                >
                  <CalendarDays size={21} />
                  <span>
                    You have{" "}
                    <strong>
                      {upcoming.length} upcoming{" "}
                      {upcoming.length === 1 ? "reservation" : "reservations"}
                    </strong>
                    . See your plans and waitlist status.
                  </span>
                  <ArrowRight size={18} />
                </button>
              )}
              <section id="directory">
                <div className="section-title">
                  <div>
                    <p className="eyebrow">FIND YOUR FOCUS</p>
                    <h2>Explore campus resources</h2>
                  </div>
                  <span className="muted">
                    {resources.length} spaces & essentials
                  </span>
                </div>
                <div className="filter-bar">
                  <div className="tabs">
                    {categories.map((c) => (
                      <button
                        key={c}
                        className={category === c ? "active" : ""}
                        onClick={() => setCategory(c)}
                      >
                        {c === "All"
                          ? "Everything"
                          : c === "Study room"
                            ? "Study rooms"
                            : c === "Creative space"
                              ? "Creative spaces"
                              : "Equipment"}
                      </button>
                    ))}
                  </div>
                  <label className="search">
                    <Search size={17} />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search name or location"
                      aria-label="Search resources"
                    />
                  </label>
                </div>
                {loading ? (
                  <div className="empty" role="status">
                    Finding your next space…
                  </div>
                ) : error ? (
                  <div className="error" role="alert">
                    {error}
                    <button onClick={() => setRetry((v) => v + 1)}>
                      Retry
                    </button>
                  </div>
                ) : resources.length ? (
                  <div className="resource-grid">
                    {resources.map((r) => (
                      <ResourceCard
                        key={r._id}
                        resource={r}
                        onOpen={setSelected}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    title="No matches just yet."
                    text="Try a different name, location, or category."
                  />
                )}
                <p className="image-note">
                  Illustrative spaces and equipment. Explore each listing for
                  booking details.
                </p>
              </section>
              <section className="how">
                <div>
                  <span>01</span>
                  <h3>Find your fit</h3>
                  <p>
                    A space to think, a place to create, or the gear you need.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <h3>Make it a plan</h3>
                  <p>
                    Choose a time, tell us your plan, and reserve your slot.
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <h3>Show up & create</h3>
                  <p>
                    Check your confirmation, bring your team, and get started.
                  </p>
                </div>
              </section>
            </>
          ) : page === "My bookings" ? (
            <MyBookings
              bookings={bookings}
              onRefresh={refresh}
              notify={notify}
            />
          ) : page === "Manage" ? (
            <Manager notify={notify} />
          ) : (
            <>
              <div className="section-title">
                <div>
                  <p className="eyebrow">STAY IN THE LOOP</p>
                  <h1>Your updates</h1>
                </div>
                <button
                  className="secondary"
                  onClick={async () => {
                    try {
                      await post("/notifications/read");
                      await refresh();
                    } catch (e) {
                      notify(e.message, true);
                    }
                  }}
                >
                  Mark all read
                </button>
              </div>
              {notifications.length ? (
                notifications.map((n) => (
                  <article
                    className={`booking-row ${!n.read ? "unread" : ""}`}
                    key={n._id}
                  >
                    <Bell size={19} />
                    <div>
                      <p>{n.message}</p>
                      <small className="muted">
                        {displayTime(n.createdAt)}
                      </small>
                    </div>
                    {!n.read && <span className="badge">New</span>}
                  </article>
                ))
              ) : (
                <Empty
                  title="All quiet for now."
                  text="Booking confirmations, approvals, and waitlist updates appear here."
                />
              )}
            </>
          )}
          <footer>
            <span>
              campusslot.{" "}
              <span className="muted">Made for the way campus works.</span>
            </span>
            <span>All booking times in IST · 08:00–20:00</span>
          </footer>
        </main>
      </div>
      {selected && (
        <BookingDialog
          resource={selected}
          close={() => setSelected(null)}
          user={user}
          onAuth={() => setShowAuth(true)}
          onBooked={(b) => {
            notify(
              b.status === "waitlisted"
                ? "You’re on the waitlist. Watch Updates for a promotion."
                : b.status === "pending"
                  ? "Request sent. A manager will review your booking."
                  : "You’re booked! Your next idea has a place.",
            );
            refresh();
          }}
        />
      )}
      {showAuth && (
        <Auth
          close={() => setShowAuth(false)}
          onSuccess={(u) => {
            setUser(u);
            notify(`Welcome, ${u.name.split(" ")[0]}.`);
          }}
        />
      )}
      {toast && (
        <div
          role={toast.error ? "alert" : "status"}
          className={`toast ${toast.error ? "toast-error" : ""}`}
        >
          {toast.error ? <X size={18} /> : <Check size={18} />}
          <span>{toast.message}</span>
          <button
            className="icon-button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
