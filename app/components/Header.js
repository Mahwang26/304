import Link from "next/link";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";
import Logo from "./Logo";

export default function Header({ cartCount, navLinks }) {
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
          {typeof cartCount === "number" && (
            <button className="cart-btn" aria-label={`Carrito, ${cartCount} productos`}>
              <ShoppingCart size={18} weight="bold" aria-hidden="true" />
              Carrito <span className="badge">{cartCount}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
