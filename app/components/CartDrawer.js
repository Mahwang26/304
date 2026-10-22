"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "@phosphor-icons/react/dist/ssr";
import { useCart } from "./CartProvider";
import CartLine from "./CartLine";
import { formatARS } from "../lib/format";

// The cart as a side panel. A native modal <dialog>: focus stays inside, Esc closes it.
export default function CartDrawer() {
  const { items, total, isOpen, closeCart } = useCart();
  const dialog = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = dialog.current;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  // Navigating (e.g. to the checkout) closes the panel.
  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  return (
    <dialog
      ref={dialog}
      className="cart-drawer"
      aria-labelledby="cart-drawer-title"
      onClose={closeCart}
      onClick={(e) => e.target === dialog.current && closeCart()}
    >
      <div className="cart-drawer-panel">
        <div className="cart-drawer-head">
          <h2 id="cart-drawer-title">Tu carrito</h2>
          <button type="button" className="cart-drawer-close" onClick={closeCart} aria-label="Cerrar el carrito">
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">Todavía no agregaste ningún tanque.</p>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <CartLine key={item.id} item={item} />
              ))}
            </ul>
            <div className="cart-drawer-foot">
              <p className="cart-total">
                <span>Total</span>
                <strong>{formatARS(total)}</strong>
              </p>
              <Link href="/checkout" className="btn-primary cart-checkout">
                Finalizar compra
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
