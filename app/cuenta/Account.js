"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GearSix, SignOut } from "@phosphor-icons/react/dist/ssr";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";
import { payOnMercadoPago } from "../lib/payments";
import { formatARS } from "../lib/format";
import { orderStatusLabel, paymentStatus } from "../lib/orderStatus";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#plastico", label: "Plástico" },
];

const DATE = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });

// "Pagar con Mercado Pago" on an unpaid order.
function PayButton({ orderId }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function pay() {
    setBusy(true);
    setError(null);
    try {
      await payOnMercadoPago(orderId);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <div className="order-pay">
      <button type="button" className="btn-primary" onClick={pay} disabled={busy}>
        {busy ? "Abriendo Mercado Pago…" : "Pagar con Mercado Pago"}
      </button>
      {error && <p className="checkout-error" role="alert">{error}</p>}
    </div>
  );
}

// The signed-in customer's orders, newest first. Filtered by account: an administrator's
// session can read every order.
function OrderHistory({ userId }) {
  const [orders, setOrders] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase()
      .from("orders")
      .select("id, created_at, status, payment_status, total_ars, address, city, province, order_items(id, description, quantity, unit_price_ars)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setFailed(true);
        else setOrders(data);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (failed) return <p className="checkout-error" role="alert">No pudimos cargar tus pedidos. Probá de nuevo en unos minutos.</p>;
  if (!orders) return <p className="account-loading">Cargando tus pedidos…</p>;
  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <p>Todavía no hiciste ningún pedido.</p>
        <Link href="/#acero" className="btn-primary">Ver tanques</Link>
      </div>
    );
  }
  return (
    <div className="orders">
      {orders.map((o) => {
        const payment = paymentStatus(o.payment_status);
        return (
          <article className="order-card" key={o.id}>
            <div className="order-card-head">
              <strong>Pedido N.º {o.id}</strong>
              <span className="order-date">{DATE.format(new Date(o.created_at))}</span>
              <span className="order-badges">
                <span className={`order-payment order-payment--${payment.tone}`}>{payment.label}</span>
                <span className="order-status">{orderStatusLabel(o.status)}</span>
              </span>
            </div>
            <ul className="checkout-lines">
              {o.order_items.map((i) => (
                <li key={i.id}>
                  <span>{i.quantity} × {i.description}</span>
                  <span>{formatARS(i.quantity * i.unit_price_ars)}</span>
                </li>
              ))}
            </ul>
            <p className="cart-total">
              <span>Total</span>
              <strong>{formatARS(o.total_ars)}</strong>
            </p>
            <p className="order-address">Entrega: {o.address}, {o.city}, {o.province}</p>
            {payment.pay && <PayButton orderId={o.id} />}
          </article>
        );
      })}
    </div>
  );
}

// Signed out: the sign-in form. Signed in: the account's email and its order history.
// `next`: where to go once signed in (set by proxy.js when it sends a visitor here).
export default function Account({ next }) {
  const { user, ready, isAdmin, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && next) router.replace(next);
  }, [user, next, router]);

  let content = null;
  if (ready && !user) {
    content = (
      <div className="account-auth">
        <AuthForm title="Ingresá a tu cuenta" intro="Con tu cuenta hacés tus pedidos y ves el historial de tus compras." />
      </div>
    );
  } else if (user) {
    content = (
      <>
        <div className="account-head">
          <div>
            <h1 className="checkout-title">Mi cuenta</h1>
            <p className="account-email">{user.email}</p>
          </div>
          <div className="account-actions">
            {isAdmin && (
              <Link href="/admin" className="btn-ghost">
                <GearSix size={18} weight="bold" aria-hidden="true" /> Panel de administración
              </Link>
            )}
            <button type="button" className="btn-ghost" onClick={signOut}>
              <SignOut size={18} weight="bold" aria-hidden="true" /> Cerrar sesión
            </button>
          </div>
        </div>
        <h2 className="account-section-title">Mis pedidos</h2>
        <OrderHistory userId={user.id} />
      </>
    );
  }

  return (
    <div className="home-dark checkout account-page">
      <Header navLinks={NAV_LINKS} />
      <main className="wrap checkout-wrap">{content}</main>
      <Footer />
    </div>
  );
}
