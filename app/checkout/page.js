import Checkout from "./Checkout";
import { getCatalog } from "../lib/catalog";

export const metadata = { title: "Finalizar compra — 304" };

export default async function Page() {
  const { steel, plastic } = await getCatalog();
  // Today's name and price of every model, by id: what the cart is checked against.
  const models = {};
  for (const line of [...steel, ...plastic]) {
    for (const m of line.models) models[m.id] = { name: `${line.name} ${m.model}`, cap: m.cap, price: m.price };
  }
  return <Checkout models={models} />;
}
