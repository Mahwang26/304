import Link from "next/link";
import { CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { syncPayment } from "../../lib/mercadopago";

export const metadata = { title: "Tu pago — 304" };

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#plastico", label: "Plástico" },
];

const MESSAGES = {
  aprobado: {
    Icon: CheckCircle,
    tone: "ok",
    title: "¡Pago aprobado!",
    text: "Ya registramos tu pago. Te vamos a contactar para coordinar la entrega.",
  },
  pendiente: {
    Icon: Clock,
    tone: "wait",
    title: "Tu pago está en proceso",
    text: "Cuando Mercado Pago lo acredite, lo vas a ver como pagado en Mi cuenta.",
  },
  fallido: {
    Icon: WarningCircle,
    tone: "fail",
    title: "El pago no se completó",
    text: "Tu pedido quedó guardado: podés volver a intentar el pago desde Mi cuenta.",
  },
};

// Where Mercado Pago sends the buyer back. The payment is read from Mercado Pago and recorded
// here too, so the order shows its status right away even before the notification arrives.
export default async function Page({ searchParams }) {
  const { payment_id: paymentId, external_reference: reference } = await searchParams;

  let result = null;
  if (paymentId && paymentId !== "null") {
    try {
      result = await syncPayment(paymentId);
    } catch (err) {
      console.error("Mercado Pago, regreso:", err);
    }
  }
  const status = result?.status;
  const message = MESSAGES[status === "aprobado" || status === "pendiente" ? status : "fallido"];
  const orderId = result?.orderId ?? (/^\d+$/.test(reference ?? "") ? reference : null);
  const { Icon } = message;

  return (
    <div className="home-dark checkout">
      <Header navLinks={NAV_LINKS} />
      <main className="wrap checkout-wrap">
        <div className={`checkout-done payment-result payment-result--${message.tone}`} role="status">
          <Icon size={56} weight="duotone" aria-hidden="true" />
          <h1>{message.title}</h1>
          {orderId && <p className="checkout-done-number">Pedido N.º {orderId}</p>}
          <p className="checkout-done-next">{message.text}</p>
          <div className="checkout-done-actions">
            <Link href="/cuenta" className="btn-primary">Ver mis pedidos</Link>
            <Link href="/" className="btn-ghost">Volver al inicio</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
