"use client";

import Link from "next/link";
import { GearSix, ShoppingCart, UserCircle } from "@phosphor-icons/react/dist/ssr";
import Logo from "./Logo";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";

export default function Header({ navLinks }) {
  const { count, openCart } = useCart();
  const { user, isAdmin } = useAuth();
  return (
    <header>
      <div className="wrap">
        <nav>
          <Link href="/" className="logo" aria-label="304, ir al inicio">
            <Logo />
          </Link>
          <div className="nav-links">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
          {isAdmin && (
            <Link href="/admin" className="account-link">
              <GearSix size={22} weight="bold" aria-hidden="true" />
              Admin
            </Link>
          )}
          <Link href="/cuenta" className="account-link">
            <UserCircle size={22} weight="bold" aria-hidden="true" />
            {user ? "Mi cuenta" : "Ingresar"}
          </Link>
          <button className="cart-btn" onClick={openCart} aria-label={`Abrir el carrito, ${count} productos`}>
            <ShoppingCart size={18} weight="bold" aria-hidden="true" />
            Carrito <span className="badge">{count}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
