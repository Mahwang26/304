import { createPreference, getOwnOrder } from "../../../lib/mercadopago";

// Starts paying an order on Mercado Pago. Body: { orderId }; header: the buyer's session
// (Authorization: Bearer …), so only the order's owner can pay it. Responds { url } to send
// the buyer to, or { error }.
export async function POST(request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  const { orderId } = await request.json().catch(() => ({}));
  if (!token || !Number.isInteger(orderId)) {
    return Response.json({ error: "El pedido no es válido." }, { status: 400 });
  }

  const order = await getOwnOrder(orderId, token);
  if (!order) return Response.json({ error: "No encontramos ese pedido en tu cuenta." }, { status: 404 });
  if (order.payment_status === "aprobado") {
    return Response.json({ error: "Este pedido ya está pagado." }, { status: 409 });
  }

  try {
    return Response.json({ url: await createPreference(order, request.nextUrl.origin) });
  } catch (err) {
    console.error("Mercado Pago, preferencia:", err);
    return Response.json({ error: "No pudimos abrir Mercado Pago. Probá de nuevo en unos minutos." }, { status: 502 });
  }
}
