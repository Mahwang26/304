import { requireAdmin } from "../../../lib/supabaseServer";
import { ORDER_STATUSES } from "../../../lib/orderStatus";

// GET /api/admin/orders?estado=enviado — every order with its products, newest first.
export async function GET(request) {
  const { db, error } = await requireAdmin();
  if (error) return error;
  let query = db
    .from("orders")
    .select("*, order_items(id, model_id, description, quantity, unit_price_ars)")
    .order("created_at", { ascending: false });
  const status = request.nextUrl.searchParams.get("estado");
  if (status) {
    if (!ORDER_STATUSES.some((s) => s.key === status)) return Response.json({ error: "Ese estado no existe." }, { status: 400 });
    query = query.eq("status", status);
  }
  const { data, error: dbError } = await query;
  if (dbError) {
    console.error("Pedidos, lectura:", dbError);
    return Response.json({ error: "No pudimos leer los pedidos." }, { status: 500 });
  }
  return Response.json(data);
}
