import Link from "next/link";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = { title: "Sin permiso — 304" };

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#plastico", label: "Plástico" },
];

// What a signed-in customer sees at /admin (proxy.js shows this page with a 403).
export default function NoPermission() {
  return (
    <div className="home-dark checkout">
      <Header navLinks={NAV_LINKS} />
      <main className="wrap checkout-wrap">
        <div className="checkout-done payment-result payment-result--fail">
          <LockKey size={56} weight="duotone" aria-hidden="true" />
          <h1>No tenés permiso para entrar acá</h1>
          <p className="checkout-done-next">Esta sección es solo para administradores de 304.</p>
          <div className="checkout-done-actions">
            <Link href="/" className="btn-primary">Volver al inicio</Link>
            <Link href="/cuenta" className="btn-ghost">Mi cuenta</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
