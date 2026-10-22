import Link from "next/link";
import { supabaseServer } from "../lib/supabaseServer";
import { formatARS } from "../lib/format";
import { ORDER_STATUSES, paymentStatus } from "../lib/orderStatus";
import OrderStatusSelect from "./OrderStatusSelect";

const DATE = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Every order (an administrator's session reads them all), with a filter by delivery status
// and the totals that matter to the shop.
export default async function AdminOrders({ searchParams }) {
  const { estado } = await searchParams;
  const db = await supabaseServer();
  const { data: orders, error } = await db
    .from("orders")
    .select("id, created_at, status, payment_status, customer_name, phone, email, address, city, province, notes, total_ars, order_items(id, description, quantity, unit_price_ars)")
    .order("created_at", { ascending: false });

  if (error) return <p className="checkout-error" role="alert">No pudimos leer los pedidos. Probá de nuevo en unos minutos.</p>;

  const filter = ORDER_STATUSES.some((s) => s.key === estado) ? estado : null;
  const shown = filter ? orders.filter((o) => o.status === filter) : orders;
  const paid = orders.filter((o) => o.payment_status === "aprobado");
  const open = orders.filter((o) => o.status !== "entregado" && o.status !== "cancelado");

  return (
    <>
      <div className="admin-stats">
        <p><strong>{orders.length}</strong><span>pedidos</span></p>
        <p><strong>{open.length}</strong><span>por entregar</span></p>
        <p><strong>{paid.length}</strong><span>pagados</span></p>
        <p><strong>{formatARS(paid.reduce((n, o) => n + o.total_ars, 0))}</strong><span>cobrado</span></p>
      </div>

      <nav className="admin-filters" aria-label="Filtrar por estado">
        <Link href="/admin" aria-current={!filter ? "page" : undefined}>Todos ({orders.length})</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s.key} href={`/admin?estado=${s.key}`} aria-current={filter === s.key ? "page" : undefined}>
            {s.label} ({orders.filter((o) => o.status === s.key).length})
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="account-loading">No hay pedidos con ese estado.</p>
      ) : (
        <div className="orders">
          {shown.map((o) => {
            const payment = paymentStatus(o.payment_status);
            return (
              <article className="order-card admin-order" key={o.id}>
                <div className="order-card-head">
                  <strong>Pedido N.º {o.id}</strong>
                  <span className="order-date">{DATE.format(new Date(o.created_at))}</span>
                  <span className="order-badges">
                    <span className={`order-payment order-payment--${payment.tone}`}>{payment.label}</span>
                  </span>
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </div>
                <div className="admin-order-body">
                  <div className="admin-customer">
                    <h3>Cliente</h3>
                    <p><strong>{o.customer_name}</strong></p>
                    <p><a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`}>{o.phone}</a> · <a href={`mailto:${o.email}`}>{o.email}</a></p>
                    <p>{o.address}, {o.city}, {o.province}</p>
                    {o.notes && <p className="admin-notes">“{o.notes}”</p>}
                  </div>
                  <div>
                    <h3>Productos</h3>
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
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
