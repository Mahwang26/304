import { syncPayment } from "../../../lib/mercadopago";

// Mercado Pago's payment notifications. The notification only says which payment changed:
// its status is read from Mercado Pago itself, so a forged notification can't mark an order
// as paid. Answering an error makes Mercado Pago retry later.
export async function POST(request) {
  const params = request.nextUrl.searchParams;
  const body = await request.json().catch(() => ({}));
  const type = body.type ?? params.get("type") ?? params.get("topic");
  const id = body.data?.id ?? params.get("data.id") ?? params.get("id");

  if (type !== "payment" || !id) return new Response(null, { status: 200 });
  try {
    await syncPayment(id);
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Mercado Pago, notificación:", err);
    return new Response(null, { status: 500 });
  }
}
