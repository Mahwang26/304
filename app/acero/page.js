import SteelCatalog from "./SteelCatalog";
import { getCatalog } from "../lib/catalog";

export const metadata = { title: "Tanques de acero inoxidable — 304" };

export default async function Page() {
  const { steel } = await getCatalog();
  return <SteelCatalog lines={steel} />;
}
