import { STEEL_PRESENTATION } from "./steelPresentation";
import { PLASTIC_PRESENTATION } from "./plasticPresentation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// How long a catalog read is reused before Supabase is asked again. Pages stay static
// and pick up edits made in the Supabase dashboard within about this many seconds.
const REVALIDATE_SECONDS = 60;

const PRESENTATION = { acero: STEEL_PRESENTATION, plastico: PLASTIC_PRESENTATION };

// Database row → the shape the catalog components use, plus the site-only presentation
// (hero one-liner, line page copy, 3D tank) for lines the code knows about.
function toLine(row) {
  return {
    key: row.key,
    name: row.name,
    desc: row.description,
    shape: row.shape,
    quality: row.quality,
    models: row.models.map((m) => ({
      id: m.id,
      model: m.model,
      cap: m.capacity_l,
      diam: m.diameter_cm,
      width: m.width_cm,
      height: m.height_cm,
      length: m.length_cm,
      outlet: m.outlet,
      price: m.price_ars,
    })),
    ...PRESENTATION[row.material]?.[row.key],
  };
}

// The whole catalog from Supabase (tables `lines` and `models`), split by material.
// Server-side only: call it from pages and pass the lines down as props.
export async function getCatalog() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver .env.local).");
  }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/lines?select=*,models(*)&order=sort_order&models.order=sort_order`,
    { headers: { apikey: SUPABASE_KEY }, next: { revalidate: REVALIDATE_SECONDS } }
  );
  if (!res.ok) throw new Error(`Supabase respondió ${res.status} al leer el catálogo.`);
  const rows = await res.json();
  return {
    steel: rows.filter((r) => r.material === "acero").map(toLine),
    plastic: rows.filter((r) => r.material === "plastico").map(toLine),
  };
}
