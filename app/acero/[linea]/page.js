import { notFound } from "next/navigation";
import SteelCatalog from "../SteelCatalog";
import { getCatalog } from "../../lib/catalog";

// Prerender the lines that exist today; a line added to the database later gets its
// page on first visit, and an unknown one is a 404.
export async function generateStaticParams() {
  const { steel } = await getCatalog();
  return steel.map((l) => ({ linea: l.key }));
}

export async function generateMetadata({ params }) {
  const { linea } = await params;
  const { steel } = await getCatalog();
  const line = steel.find((l) => l.key === linea);
  return { title: line ? `Tanques de acero ${line.name} — 304` : "304" };
}

export default async function LineaPage({ params }) {
  const { linea } = await params;
  const { steel } = await getCatalog();
  if (!steel.some((l) => l.key === linea)) notFound();
  return <SteelCatalog lines={steel} lineKey={linea} />;
}
