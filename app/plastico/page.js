import PlasticCatalog from "./PlasticCatalog";
import { getCatalog } from "../lib/catalog";

export const metadata = { title: "Tanques de plástico — 304" };

export default async function Page() {
  const { plastic } = await getCatalog();
  return <PlasticCatalog lines={plastic} />;
}
