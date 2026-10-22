import { supabase } from "./supabase";

// From the browser: asks the site's server for the Mercado Pago page that pays `orderId`, and
// goes there. Throws an Error with a message for the buyer when it can't.
export async function payOnMercadoPago(orderId) {
  const { data } = await supabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Iniciá sesión para pagar el pedido.");

  let res;
  try {
    res = await fetch("/api/mercadopago/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId }),
    });
  } catch {
    throw new Error("No pudimos abrir Mercado Pago. Revisá tu conexión y probá de nuevo.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) throw new Error(body.error ?? "No pudimos abrir Mercado Pago. Probá de nuevo en unos minutos.");
  window.location.assign(body.url);
}
