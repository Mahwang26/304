import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/supabaseServer";
import { catalogWriteError, parseModel } from "../../../lib/modelInput";

const COLUMNS = "id, line_key, model, capacity_l, diameter_cm, width_cm, height_cm, length_cm, outlet, price_ars, sort_order";

// GET /api/admin/models?linea=classic — the catalog's models, optionally of one line.
export async function GET(request) {
  const { db, error } = await requireAdmin();
  if (error) return error;
  let query = db.from("models").select(COLUMNS).order("line_key").order("sort_order");
  const line = request.nextUrl.searchParams.get("linea");
  if (line) query = query.eq("line_key", line);
  const { data, error: dbError } = await query;
  if (dbError) return catalogWriteError(dbError);
  return Response.json(data);
}

// POST /api/admin/models — adds a model to a line. Answers 201 with the new model.
export async function POST(request) {
  const { db, error } = await requireAdmin();
  if (error) return error;
  const { value, error: invalid } = parseModel(await request.json().catch(() => null));
  if (invalid) return Response.json({ error: invalid }, { status: 400 });

  if (value.sort_order == null) {
    // At the end of its line.
    const { data: last } = await db.from("models").select("sort_order").eq("line_key", value.line_key).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    value.sort_order = (last?.sort_order ?? 0) + 1;
  }
  const { data, error: dbError } = await db.from("models").insert(value).select(COLUMNS).single();
  if (dbError) return catalogWriteError(dbError);
  revalidatePath("/", "layout");
  return Response.json(data, { status: 201 });
}
