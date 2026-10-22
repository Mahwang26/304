import { createBrowserClient } from "@supabase/ssr";

// The browser's Supabase client. It keeps the signed-in customer's session in cookies, so the
// server (proxy.js, admin pages and Route Handlers) can read it too, and sends it with every
// request, so the database knows who is asking. Client components only, from effects or
// event handlers.
let client;
export function supabase() {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return client;
}
