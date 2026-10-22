import { notFound } from "next/navigation";
import PlasticCatalog from "../PlasticCatalog";
import { getCatalog } from "../../lib/catalog";

// Prerender the lines that exist today; a line added to the database later gets its
// page on first visit, and an unknown one is a 404.
export async function generateStaticParams() {
  const { plastic } = await getCatalog();
  return plastic.map((l) => ({ linea: l.key }));
}

export async function generateMetadata({ params }) {
  const { linea } = await params;
  const { plastic } = await getCatalog();
  const line = plastic.find((l) => l.key === linea);
  return { title: line ? `Tanques de plástico ${line.name} — 304` : "304" };
}

export default async function LineaPage({ params }) {
  const { linea } = await params;
  const { plastic } = await getCatalog();
  if (!plastic.some((l) => l.key === linea)) notFound();
  return <PlasticCatalog lines={plastic} lineKey={linea} />;
}
