import "server-only";
import { sendPaidOrderEmail } from "./orderEmail";

// Mercado Pago (Checkout Pro), from the server only: it uses the account's access token and
// the payments secret that lets the site record a payment in the database.

const MP_API = "https://api.mercadopago.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Mercado Pago's payment status → the order's `payment_status`.
const PAYMENT_STATUS = {
  approved: "aprobado",
  authorized: "pendiente",
  in_process: "pendiente",
  in_mediation: "pendiente",
  pending: "pendiente",
  rejected: "rechazado",
  cancelled: "rechazado",
  refunded: "devuelto",
  charged_back: "devuelto",
};

async function mp(path, init = {}) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN.");
  const res = await fetch(MP_API + path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${data?.message ?? "sin detalle"}`);
  return data;
}

// The order as its owner sees it, read with their session: null when it doesn't exist or
// isn't theirs.
export async function getOwnOrder(orderId, userToken) {
  const select = "id,total_ars,payment_status,order_items(id,description,quantity,unit_price_ars)";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=${select}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${userToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const [order] = await res.json();
  return order ?? null;
}

// A Checkout Pro payment for the order. Resolves to the Mercado Pago URL to send the buyer
// to. `origin` is this site's address, where Mercado Pago sends the buyer back and, on a
// public https address, its payment notifications.
export async function createPreference(order, origin) {
  const back = `${origin}/checkout/resultado`;
  const isPublic = origin.startsWith("https://");
  const preference = await mp("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: order.order_items.map((i) => ({
        id: String(i.id),
        title: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price_ars,
        currency_id: "ARS",
      })),
      external_reference: String(order.id),
      statement_descriptor: "304 TANQUES",
      back_urls: { success: back, pending: back, failure: back },
      ...(isPublic && { auto_return: "approved", notification_url: `${origin}/api/mercadopago/webhook` }),
    }),
  });
  return process.env.MP_ACCESS_TOKEN.startsWith("TEST-") ? preference.sandbox_init_point : preference.init_point;
}

// Reads a payment from Mercado Pago (the only trusted source) and records it on its order.
// The first time an order is paid, 304 gets a mail about it. Resolves to { orderId, status },
// or null when the payment isn't for one of our orders.
export async function syncPayment(paymentId) {
  if (!/^\d+$/.test(String(paymentId))) return null;
  const payment = await mp(`/v1/payments/${paymentId}`);
  const orderId = Number(payment.external_reference);
  if (!Number.isInteger(orderId) || orderId <= 0) return null;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_payment`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      p_secret: process.env.PAYMENTS_SECRET,
      p_order_id: orderId,
      p_payment_id: String(payment.id),
      p_status: PAYMENT_STATUS[payment.status] ?? "pendiente",
      p_amount: payment.transaction_amount,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`record_payment ${res.status}: ${await res.text()}`);
  // { status, newly_paid, order? } (supabase/aviso-pago.sql); a plain status before that update.
  const out = await res.json();
  const status = typeof out === "string" ? out : out.status;
  if (out?.newly_paid && out.order) {
    // A mail that fails must not undo the payment, which is already recorded.
    await sendPaidOrderEmail(out.order, payment.id).catch((err) => console.error("Aviso de pago por mail:", err));
  }
  return { orderId, status };
}
