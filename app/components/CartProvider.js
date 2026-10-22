"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import CartDrawer from "./CartDrawer";

const STORAGE_KEY = "304-cart";
const MAX_QTY = 99;

const CartContext = createContext(null);

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return cart;
}

// The shopping cart, shared by every page and kept across reloads in localStorage.
// An item is { id (the model's id in the database), name, cap, price, qty }.
// `lineOf` maps a model id to its line's key.
export default function CartProvider({ lineOf, children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  // False until the saved cart has been read, so the first render can't overwrite it.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  // qty <= 0 removes the item; adding an item that isn't in the cart needs its data in `model`.
  const setQty = useCallback((id, qty, model) => {
    setItems((prev) => {
      const next = Math.min(MAX_QTY, qty);
      if (next <= 0) return prev.filter((i) => i.id !== id);
      if (prev.some((i) => i.id === id)) return prev.map((i) => (i.id === id ? { ...i, qty: next } : i));
      return model ? [...prev, { ...model, id, qty: next }] : prev;
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      items,
      lineOf,
      hydrated,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      qtyOf: (id) => items.find((i) => i.id === id)?.qty ?? 0,
      setQty,
      clear,
      isOpen: open,
      openCart,
      closeCart,
    }),
    [items, lineOf, hydrated, open, setQty, clear, openCart, closeCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
