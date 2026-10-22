import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase as the signed-in visitor, on the server (Server Components and Route Handlers):
// the session comes from the request's cookies, so RLS applies exactly as in the browser.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        // Server Components can't set cookies; proxy.js keeps the session fresh instead.
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {}
      },
    },
  });
}

// For admin-only Route Handlers: the client plus a ready error Response when the visitor
// isn't a signed-in administrator. The database enforces the same rule through RLS.
export async function requireAdmin() {
  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { db, error: Response.json({ error: "Iniciá sesión." }, { status: 401 }) };
  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) return { db, error: Response.json({ error: "No tenés permiso de administrador." }, { status: 403 }) };
  return { db, user, error: null };
}
