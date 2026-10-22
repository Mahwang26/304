"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "../lib/orderStatus";

// The order's delivery status, saved as soon as it changes (PATCH /api/admin/orders/:id).
export default function OrderStatusSelect({ orderId, status }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [state, setState] = useState(null); // null | "saving" | "saved" | error message

  async function change(e) {
    const next = e.target.value;
    const previous = value;
    setValue(next);
    setState("saving");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No pudimos cambiar el estado.");
      setState("saved");
      router.refresh();
    } catch (err) {
      setValue(previous);
      setState(err.message === "Failed to fetch" ? "No pudimos conectarnos." : err.message);
    }
  }

  return (
    <label className="admin-status">
      <span className="visually-hidden">Estado del pedido {orderId}</span>
      <select value={value} onChange={change} disabled={state === "saving"}>
        {ORDER_STATUSES.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
      {state === "saving" && <small>Guardando…</small>}
      {state === "saved" && <small className="admin-ok">Guardado</small>}
      {state && state !== "saving" && state !== "saved" && <small className="admin-err" role="alert">{state}</small>}
    </label>
  );
}
