import React, { useEffect, useRef } from "react";
import { CalendarDays, BookOpen, Camera, Lightbulb, X } from "lucide-react";

export function Icon({ category, ...props }) {
  const C =
    category === "Study room"
      ? BookOpen
      : category === "Equipment"
        ? Camera
        : Lightbulb;
  return <C {...props} />;
}

export function Modal({ title, close, children }) {
  const panel = useRef(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const previousFocus = document.activeElement;
    panel.current?.querySelector("button, input, select, textarea")?.focus();
    const handler = (e) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== panel.current) return;
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const items = Array.from(
          panel.current.querySelectorAll(
            "button:not(:disabled), input:not(:disabled), select, textarea, a[href]",
          ),
        );
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return (
    <div className="overlay" onClick={close}>
      <section
        ref={panel}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close dialog"
          >
            <X />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function Empty({ title, text }) {
  return (
    <div className="empty">
      <CalendarDays size={36} strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
