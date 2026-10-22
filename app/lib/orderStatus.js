// An order's delivery status (`orders.status`, changed by an administrator) as the site shows
// it. The database accepts only these keys (orders_status_check in supabase/admin.sql).
export const ORDER_STATUSES = [
  { key: "nuevo", label: "Recibido" },
  { key: "en_preparacion", label: "En preparación" },
  { key: "enviado", label: "Enviado" },
  { key: "entregado", label: "Entregado" },
  { key: "cancelado", label: "Cancelado" },
];

export function orderStatusLabel(key) {
  return ORDER_STATUSES.find((s) => s.key === key)?.label ?? key;
}

// The order's payment (`payment_status`, written from Mercado Pago's notifications). `pay`:
// whether the customer can (still) pay it from Mi cuenta.
export const PAYMENT_STATUSES = {
  sin_pagar: { label: "Falta pagar", tone: "todo", pay: true },
  pendiente: { label: "Pago en proceso", tone: "wait" },
  aprobado: { label: "Pagado", tone: "ok" },
  rechazado: { label: "Pago rechazado", tone: "fail", pay: true },
  devuelto: { label: "Pago devuelto", tone: "fail" },
  monto_incorrecto: { label: "Revisando el pago", tone: "wait" },
};

export function paymentStatus(key) {
  return PAYMENT_STATUSES[key] ?? PAYMENT_STATUSES.sin_pagar;
}
