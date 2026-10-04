import { notFound } from "next/navigation";
import SteelCatalog from "../SteelCatalog";
import { STEEL_LINES } from "../../lib/steelLines";

// Only the known lines exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return STEEL_LINES.map((l) => ({ linea: l.key }));
}

export async function generateMetadata({ params }) {
  const { linea } = await params;
  const line = STEEL_LINES.find((l) => l.key === linea);
  return { title: line ? `Tanques de acero ${line.name} — 304` : "304" };
}

export default async function LineaPage({ params }) {
  const { linea } = await params;
  if (!STEEL_LINES.some((l) => l.key === linea)) notFound();
  return <SteelCatalog lineKey={linea} />;
}
