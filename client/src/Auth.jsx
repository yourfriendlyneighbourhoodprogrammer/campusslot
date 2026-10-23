import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { post } from "./api";
import { Modal } from "./ui";
const categories = ["All", "Study room", "Creative space", "Equipment"];
export default function Auth({ close, onSuccess }) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onSuccess(
        await post(
          `/auth/${register ? "register" : "login"}`,
          Object.fromEntries(new FormData(e.target)),
        ),
      );
      close();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={register ? "Your campus, connected." : "Welcome back."}
      close={close}
    >
      <p className="muted">Sign in to reserve your next space.</p>
      <form onSubmit={submit}>
        {register && (
          <label>
            Full name
            <input
              name="name"
              required
              minLength={2}
              maxLength={60}
              autoComplete="name"
              autoFocus
            />
          </label>
        )}
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            autoFocus={!register}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete={register ? "new-password" : "current-password"}
          />
        </label>
        {register && (
          <small>
            Use 8–72 characters. Your account will be a student account.
          </small>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
          <ArrowRight size={16} />
        </button>
      </form>
      <button
        className="text-button"
        onClick={() => {
          setRegister(!register);
          setError("");
        }}
      >
        {register
          ? "Already have an account? Sign in"
          : "New here? Create an account"}
      </button>
    </Modal>
  );
}
