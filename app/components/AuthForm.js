"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

// Sign in or create an account with email and password. Once signed in, AuthProvider
// updates and the page shows what this form was standing in for.
export default function AuthForm({ title, intro }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const signup = mode === "signup";

  function switchTo(next) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { email, password, password2 } = Object.fromEntries(new FormData(e.currentTarget));
    if (signup && password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      if (!signup) await signIn(email, password);
      else if (await signUp(email, password)) {
        setNotice(`Te mandamos un mail a ${email} para confirmar tu cuenta. Confirmala y después ingresá.`);
        setMode("login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="auth-panel">
      <h2>{title}</h2>
      {intro && <p className="auth-intro">{intro}</p>}
      <div className="auth-switch">
        <button type="button" aria-pressed={!signup} onClick={() => switchTo("login")}>Ingresar</button>
        <button type="button" aria-pressed={signup} onClick={() => switchTo("signup")}>Crear cuenta</button>
      </div>
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      <form onSubmit={handleSubmit}>
        <div className="checkout-fields">
          <label className="wide">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required maxLength={200} />
          </label>
          <label className="wide">
            <span>Contraseña {signup && <em>(mínimo 6 caracteres)</em>}</span>
            <input
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              required
              minLength={signup ? 6 : undefined}
              maxLength={72}
            />
          </label>
          {signup && (
            <label className="wide">
              <span>Repetí la contraseña</span>
              <input name="password2" type="password" autoComplete="new-password" required minLength={6} maxLength={72} />
            </label>
          )}
        </div>
        {error && <p className="checkout-error" role="alert">{error}</p>}
        <button type="submit" className="btn-primary checkout-submit" disabled={sending}>
          {sending ? "Un momento…" : signup ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
