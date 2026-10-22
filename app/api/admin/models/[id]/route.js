import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../../lib/supabaseServer";
import { catalogWriteError, parseModel } from "../../../../lib/modelInput";

const COLUMNS = "id, line_key, model, capacity_l, diameter_cm, width_cm, height_cm, length_cm, outlet, price_ars, sort_order";

function modelId(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PATCH /api/admin/models/:id — changes some of a model's fields (price, sizes, …).
export async function PATCH(request, { params }) {
  const { db, error } = await requireAdmin();
  if (error) return error;
  const id = modelId(await params);
  if (!id) return Response.json({ error: "El modelo no es válido." }, { status: 400 });
  const { value, error: invalid } = parseModel(await request.json().catch(() => null), { partial: true });
  if (invalid) return Response.json({ error: invalid }, { status: 400 });

  const { data, error: dbError } = await db.from("models").update(value).eq("id", id).select(COLUMNS).maybeSingle();
  if (dbError) return catalogWriteError(dbError);
  if (!data) return Response.json({ error: "Ese modelo no existe." }, { status: 404 });
  revalidatePath("/", "layout");
  return Response.json(data);
}

// DELETE /api/admin/models/:id — removes a model. Past orders keep its name and price.
export async function DELETE(_request, { params }) {
  const { db, error } = await requireAdmin();
  if (error) return error;
  const id = modelId(await params);
  if (!id) return Response.json({ error: "El modelo no es válido." }, { status: 400 });

  const { data, error: dbError } = await db.from("models").delete().eq("id", id).select("id").maybeSingle();
  if (dbError) return catalogWriteError(dbError);
  if (!data) return Response.json({ error: "Ese modelo no existe." }, { status: 404 });
  revalidatePath("/", "layout");
  return new Response(null, { status: 204 });
}
