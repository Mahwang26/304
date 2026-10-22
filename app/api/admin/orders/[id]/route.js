import { requireAdmin } from "../../../../lib/supabaseServer";
import { ORDER_STATUSES } from "../../../../lib/orderStatus";

// PATCH /api/admin/orders/:id — body { status }: moves the order along its delivery
// (Recibido → En preparación → Enviado → Entregado, or Cancelado). The database only lets an
// administrator change this one column.
export async function PATCH(request, { params }) {
  const { db, error } = await requireAdmin();
  if (error) return error;
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "El pedido no es válido." }, { status: 400 });
  const { status } = (await request.json().catch(() => null)) ?? {};
  if (!ORDER_STATUSES.some((s) => s.key === status)) {
    return Response.json({ error: "Ese estado no existe." }, { status: 400 });
  }

  const { data, error: dbError } = await db.from("orders").update({ status }).eq("id", id).select("id, status").maybeSingle();
  if (dbError) {
    console.error("Pedidos, estado:", dbError);
    return Response.json({ error: "No pudimos cambiar el estado. Probá de nuevo en unos minutos." }, { status: 500 });
  }
  if (!data) return Response.json({ error: "Ese pedido no existe." }, { status: 404 });
  return Response.json(data);
}
