"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return auth;
}

// Supabase Auth error codes, in the customer's words.
const AUTH_ERRORS = {
  invalid_credentials: "El email o la contraseña no son correctos.",
  user_already_exists: "Ya hay una cuenta con ese email. Ingresá con tu contraseña.",
  email_exists: "Ya hay una cuenta con ese email. Ingresá con tu contraseña.",
  weak_password: "La contraseña tiene que tener al menos 6 caracteres.",
  email_address_invalid: "El email no es válido.",
  validation_failed: "Revisá el email y la contraseña.",
  email_not_confirmed: "Todavía no confirmaste tu email: buscá el mail que te mandamos.",
  over_email_send_rate_limit: "Hubo demasiados intentos. Probá de nuevo en unos minutos.",
  over_request_rate_limit: "Hubo demasiados intentos. Probá de nuevo en unos minutos.",
};

function authError(error) {
  return new Error(AUTH_ERRORS[error.code] ?? "No pudimos conectarnos. Probá de nuevo en unos minutos.");
}

// The signed-in customer (Supabase Auth, email and password), shared by every page.
// `ready` is false until the saved session has been read. `isAdmin` only decides what to show;
// the database and proxy.js are what actually enforce the role.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  // Whether an account is an administrator, tagged with the account it was checked for.
  const [role, setRole] = useState(null);
  const isAdmin = !!user && role?.userId === user.id && role.admin;
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase()
      .rpc("is_admin")
      .then(({ data }) => !cancelled && setRole({ userId, admin: data === true }));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    // Fires once with the saved session, then on every sign-in, sign-out and token refresh.
    const { data } = supabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAdmin,
      async signIn(email, password) {
        const { error } = await supabase().auth.signInWithPassword({ email, password });
        if (error) throw authError(error);
      },
      // Resolves to true when the new account must confirm its email before signing in.
      async signUp(email, password) {
        const { data, error } = await supabase().auth.signUp({ email, password });
        if (error) throw authError(error);
        return !data.session;
      },
      async signOut() {
        await supabase().auth.signOut();
      },
    }),
    [user, ready, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
