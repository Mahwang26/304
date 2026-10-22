import { supabaseServer } from "../../lib/supabaseServer";
import CatalogEditor from "./CatalogEditor";

// The catalog as it is in the database right now (not the site's cached copy), to edit.
export default async function AdminCatalog() {
  const db = await supabaseServer();
  const { data: lines, error } = await db
    .from("lines")
    .select("key, name, material, shape, models(id, model, capacity_l, diameter_cm, width_cm, height_cm, length_cm, outlet, price_ars, sort_order)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "models" });

  if (error) return <p className="checkout-error" role="alert">No pudimos leer el catálogo. Probá de nuevo en unos minutos.</p>;
  return (
    <>
      <p className="admin-intro">
        Los cambios se ven en el sitio en la próxima visita. Los pedidos ya hechos conservan el nombre y el precio que tenían.
      </p>
      <CatalogEditor lines={lines} />
    </>
  );
}
