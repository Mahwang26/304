"use client";

import Image from "next/image";
import { useCart } from "./CartProvider";
import QuantityStepper from "./QuantityStepper";
import { formatARS } from "../lib/format";

// A cart row: the tank's picture, its name and quantity, and the price of all its units.
// `item` is { id, name, cap, price, qty }.
export default function CartLine({ item }) {
  const { lineOf, setQty } = useCart();
  const line = lineOf[item.id];
  return (
    <li>
      <span className="cart-thumb">
        {/* Eager: a lazy image inside the closed drawer would only start loading once it opens. */}
        {line && <Image src={`/tanks/${line}.png`} alt="" fill sizes="80px" loading="eager" />}
      </span>
      <div className="cart-line-info">
        <strong>{item.name}</strong>
        <small>{item.cap.toLocaleString("es-AR")} L · {formatARS(item.price)} c/u</small>
        <QuantityStepper qty={item.qty} name={item.name} onChange={(q) => setQty(item.id, q)} />
      </div>
      <span className="cart-line-total">{formatARS(item.qty * item.price)}</span>
    </li>
  );
}
