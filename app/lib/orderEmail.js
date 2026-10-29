import "server-only";
import { formatARS } from "./format";

// The mail 304 gets when an order is paid (sent with Resend, https://resend.com).
// RESEND_API_KEY: the Resend account's API key. ORDER_NOTIFY_EMAIL: who receives it (without a
// verified domain, Resend only delivers to the address the account was created with).
// Without them nothing is sent, and the payment is recorded all the same.

const escape = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function paidOrderHtml(order, paymentId) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escape(i.quantity)} × ${escape(i.description)}</td>` +
        `<td style="padding:6px 0;text-align:right">${escape(formatARS(i.quantity * i.unit_price_ars))}</td></tr>`
    )
    .join("");
  return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:560px">
<h2 style="margin:0 0 4px">Pedido N.º ${escape(order.id)} pagado</h2>
<p style="margin:0 0 16px;color:#555">Mercado Pago aprobó el pago (operación ${escape(paymentId)}).</p>
<table style="width:100%;border-collapse:collapse;border-top:1px solid #ddd">${rows}
<tr><td style="padding:10px 0;border-top:1px solid #ddd"><strong>Total</strong></td>
<td style="padding:10px 0;border-top:1px solid #ddd;text-align:right"><strong>${escape(formatARS(order.total_ars))}</strong></td></tr></table>
<h3 style="margin:20px 0 6px">Cliente</h3>
<p style="margin:0;line-height:1.6">${escape(order.customer_name)}<br>
Tel.: ${escape(order.phone)}<br>
Email: ${escape(order.email)}<br>
Entrega: ${escape(order.address)}, ${escape(order.city)}, ${escape(order.province)}</p>
${order.notes ? `<p style="margin:12px 0 0"><em>Aclaraciones:</em> ${escape(order.notes)}</p>` : ""}
<p style="margin:20px 0 0;color:#555">Coordiná la entrega y, cuando salga, cambiá su estado en el panel de administración del sitio.</p>
</body></html>`;
}

export async function sendPaidOrderEmail(order, paymentId) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!key || !to) {
    console.warn("Aviso de pago: falta RESEND_API_KEY u ORDER_NOTIFY_EMAIL, no se mandó el mail.");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ORDER_NOTIFY_FROM ?? "304 Tienda <onboarding@resend.dev>",
      to: [to],
      reply_to: order.email,
      subject: `Pedido N.º ${order.id} pagado — ${formatARS(order.total_ars)}`,
      html: paidOrderHtml(order, paymentId),
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}
