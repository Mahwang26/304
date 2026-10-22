"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartLine from "../components/CartLine";
import AuthForm from "../components/AuthForm";
import { useCart } from "../components/CartProvider";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";
import { payOnMercadoPago } from "../lib/payments";
import { formatARS } from "../lib/format";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#plastico", label: "Plástico" },
];

const FIELDS = [
  { name: "name", label: "Nombre y apellido", autoComplete: "name" },
  { name: "phone", label: "Teléfono", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "address", label: "Dirección de entrega", autoComplete: "street-address", wide: true },
  { name: "city", label: "Localidad", autoComplete: "address-level2" },
  { name: "province", label: "Provincia", autoComplete: "address-level1" },
];

const GENERIC_ERROR = "No pudimos registrar el pedido. Revisá tu conexión y probá de nuevo en unos minutos.";

// Saves the order, under the signed-in account, through the `create_order` database
// function, which takes the prices from the catalog itself. Resolves to { order_id, total_ars }.
async function createOrder(customer, items) {
  const { data, error } = await supabase().rpc("create_order", { customer, items });
  // P0001 is a message the database function wrote for the buyer; anything else is internal.
  if (error) throw new Error(error.code === "P0001" ? error.message : GENERIC_ERROR);
  return data;
}

// The details of the account's last order, to fill the form in; just the email for a
// first order.
async function lastDetails(user) {
  const { data } = await supabase()
    .from("orders")
    .select("customer_name, phone, address, city, province")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return { email: user.email };
  const { customer_name, ...rest } = data;
  return { ...rest, name: customer_name, email: user.email };
}

// Checkout: the buyer's details and the order summary. Confirming needs an account, so
// signed-out buyers get the sign-in form first. Once the order is saved, the buyer goes to
// Mercado Pago to pay it. `models` is today's catalog by model id
// ({ name, cap, price }), so the summary never shows a stale price.
export default function Checkout({ models }) {
  const { items, hydrated, clear } = useCart();
  const { user, ready } = useAuth();
  // The form's starting values, tagged with the account they were loaded for.
  const [loaded, setLoaded] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const lines = items.filter((i) => models[i.id]).map((i) => ({ id: i.id, qty: i.qty, ...models[i.id] }));
  const total = lines.reduce((n, l) => n + l.qty * l.price, 0);

  const details = user && loaded?.userId === user.id ? loaded.values : null;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    lastDetails(user)
      .catch(() => ({ email: user.email }))
      .then((values) => !cancelled && setLoaded({ userId: user.id, values }));
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    const customer = Object.fromEntries(new FormData(e.currentTarget));
    setSending(true);
    setError(null);
    try {
      const saved = await createOrder(customer, lines.map((l) => ({ model_id: l.id, quantity: l.qty })));
      setOrder({ id: saved.order_id, total: saved.total_ars, lines });
      clear();
      await pay(saved.order_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  // Leaves for Mercado Pago; if it can't, the saved order stays on screen with the reason.
  async function pay(orderId) {
    setOrder((o) => ({ ...o, payError: null }));
    try {
      await payOnMercadoPago(orderId);
    } catch (err) {
      setOrder((o) => ({ ...o, payError: err.message }));
    }
  }

  let buyer = null;
  if (!user) {
    buyer = (
      <AuthForm
        title="Ingresá para confirmar tu pedido"
        intro="Con tu cuenta vas a poder ver este pedido y los próximos en Mi cuenta."
      />
    );
  } else if (details) {
    buyer = (
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2>Tus datos</h2>
        <p className="checkout-account">Comprás con la cuenta {user.email}</p>
        <div className="checkout-fields">
          {FIELDS.map((f) => (
            <label key={f.name} className={f.wide ? "wide" : undefined}>
              <span>{f.label}</span>
              <input
                name={f.name}
                type={f.type ?? "text"}
                autoComplete={f.autoComplete}
                defaultValue={details[f.name] ?? ""}
                required
                maxLength={200}
              />
            </label>
          ))}
          <label className="wide">
            <span>Aclaraciones <em>(opcional)</em></span>
            <textarea name="notes" rows={3} maxLength={1000} />
          </label>
        </div>
        {error && <p className="checkout-error" role="alert">{error}</p>}
        <button type="submit" className="btn-primary checkout-submit" disabled={sending}>
          {sending ? "Guardando tu pedido…" : "Confirmar y pagar"}
        </button>
        <p className="checkout-help">
          El pago se hace en Mercado Pago: con tarjeta, dinero en cuenta o en efectivo.
        </p>
      </form>
    );
  }

  let content;
  if (order) {
    content = (
      <div className="checkout-done" role="status">
        <CheckCircle size={56} weight="duotone" aria-hidden="true" />
        <h1>{order.payError ? "Tu pedido quedó guardado" : "Te llevamos a Mercado Pago…"}</h1>
        <p className="checkout-done-number">Pedido N.º {order.id}</p>
        <ul className="checkout-lines">
          {order.lines.map((l) => (
            <li key={l.id}>
              <span>{l.qty} × {l.name}</span>
              <span>{formatARS(l.qty * l.price)}</span>
            </li>
          ))}
        </ul>
        <p className="cart-total">
          <span>Total</span>
          <strong>{formatARS(order.total)}</strong>
        </p>
        {order.payError ? (
          <>
            <p className="checkout-error" role="alert">{order.payError}</p>
            <p className="checkout-done-next">Podés pagarlo ahora o más tarde desde Mi cuenta.</p>
            <div className="checkout-done-actions">
              <button type="button" className="btn-primary" onClick={() => pay(order.id)}>Pagar con Mercado Pago</button>
              <Link href="/cuenta" className="btn-ghost">Ver mis pedidos</Link>
            </div>
          </>
        ) : (
          <p className="checkout-done-next">En un momento se abre la página de pago.</p>
        )}
      </div>
    );
  } else if (!hydrated || !ready) {
    content = null;
  } else if (lines.length === 0) {
    content = (
      <div className="checkout-done">
        <h1>Tu carrito está vacío</h1>
        <p className="checkout-done-next">Elegí un tanque del catálogo para empezar tu pedido.</p>
        <Link href="/#acero" className="btn-primary">Ver tanques</Link>
      </div>
    );
  } else {
    content = (
      <>
        <Link className="back-link" href="/">
          <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Seguir comprando
        </Link>
        <h1 className="checkout-title">Finalizar compra</h1>
        <div className="checkout-grid">
          <div>{buyer}</div>

          <aside className="checkout-summary" aria-label="Resumen del pedido">
            <h2>Tu pedido</h2>
            <ul className="cart-list">
              {lines.map((l) => (
                <CartLine key={l.id} item={l} />
              ))}
            </ul>
            <p className="cart-total">
              <span>Total</span>
              <strong>{formatARS(total)}</strong>
            </p>
          </aside>
        </div>
      </>
    );
  }

  return (
    <div className="home-dark checkout">
      <Header navLinks={NAV_LINKS} />
      <main className="wrap checkout-wrap">{content}</main>
      <Footer />
    </div>
  );
}
