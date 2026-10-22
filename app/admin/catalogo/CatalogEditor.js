"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FloppyDisk, Plus, Trash } from "@phosphor-icons/react/dist/ssr";

// Columns of a line's table: horizontal tanks have width and length instead of a diameter.
function columnsFor(line) {
  const sizes =
    line.shape === "horizontal"
      ? [
          { key: "width_cm", label: "Ancho (cm)" },
          { key: "height_cm", label: "Alto (cm)" },
          { key: "length_cm", label: "Largo (cm)" },
        ]
      : [
          { key: "diameter_cm", label: "Diámetro (cm)" },
          { key: "height_cm", label: "Alto (cm)" },
        ];
  return [
    { key: "model", label: "Modelo", text: true },
    { key: "capacity_l", label: "Capacidad (L)" },
    ...sizes,
    { key: "outlet", label: "Salida", text: true },
    { key: "price_ars", label: "Precio ($)" },
  ];
}

function toForm(model, columns) {
  return Object.fromEntries(columns.map((c) => [c.key, model?.[c.key] == null ? "" : String(model[c.key])]));
}

// Sends one change to the admin API; resolves to the answer's body or throws its message.
async function send(url, method, body) {
  let res;
  try {
    res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
  } catch {
    throw new Error("No pudimos conectarnos. Revisá tu conexión.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "No pudimos guardar el cambio.");
  return data;
}

function Cell({ column, value, onChange, label }) {
  return (
    <td>
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(column.key, e.target.value)}
        inputMode={column.text ? "text" : "numeric"}
        className={column.text ? "admin-input admin-input--text" : "admin-input"}
      />
    </td>
  );
}

// An existing model: edit its fields and save, or delete it.
function ModelRow({ model, columns }) {
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(model, columns));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const original = toForm(model, columns);
  const changed = columns.filter((c) => form[c.key] !== original[c.key]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  };

  async function save() {
    setBusy(true);
    try {
      await send(`/api/admin/models/${model.id}`, "PATCH", Object.fromEntries(changed.map((c) => [c.key, form[c.key]])));
      setMessage({ ok: true, text: "Guardado" });
      router.refresh();
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`¿Borrar el modelo ${model.model} del catálogo?`)) return;
    setBusy(true);
    try {
      await send(`/api/admin/models/${model.id}`, "DELETE");
      router.refresh();
    } catch (err) {
      setMessage({ ok: false, text: err.message });
      setBusy(false);
    }
  }

  return (
    <tr>
      {columns.map((c) => (
        <Cell key={c.key} column={c} value={form[c.key]} onChange={set} label={`${c.label}, modelo ${model.model}`} />
      ))}
      <td className="admin-row-actions">
        <button type="button" className="admin-btn" onClick={save} disabled={busy || changed.length === 0}>
          <FloppyDisk size={16} weight="bold" aria-hidden="true" /> Guardar
        </button>
        <button type="button" className="admin-btn admin-btn--danger" onClick={remove} disabled={busy} aria-label={`Borrar el modelo ${model.model}`}>
          <Trash size={16} weight="bold" aria-hidden="true" />
        </button>
        {message && <small className={message.ok ? "admin-ok" : "admin-err"} role={message.ok ? "status" : "alert"}>{message.text}</small>}
      </td>
    </tr>
  );
}

// The empty row at the end of a line's table, to add a model.
function NewModelRow({ line, columns }) {
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(null, columns));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  };

  async function add() {
    setBusy(true);
    try {
      const body = { line_key: line.key, ...Object.fromEntries(columns.filter((c) => form[c.key] !== "").map((c) => [c.key, form[c.key]])) };
      await send("/api/admin/models", "POST", body);
      setForm(toForm(null, columns));
      setMessage({ ok: true, text: "Agregado" });
      router.refresh();
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="admin-new-row">
      {columns.map((c) => (
        <Cell key={c.key} column={c} value={form[c.key]} onChange={set} label={`${c.label}, modelo nuevo de ${line.name}`} />
      ))}
      <td className="admin-row-actions">
        <button type="button" className="admin-btn admin-btn--add" onClick={add} disabled={busy}>
          <Plus size={16} weight="bold" aria-hidden="true" /> Agregar
        </button>
        {message && <small className={message.ok ? "admin-ok" : "admin-err"} role={message.ok ? "status" : "alert"}>{message.text}</small>}
      </td>
    </tr>
  );
}

// Every line with its models, editable in place.
export default function CatalogEditor({ lines }) {
  return lines.map((line) => {
    const columns = columnsFor(line);
    return (
      <section className="admin-line" key={line.key} aria-labelledby={`admin-line-${line.key}`}>
        <h2 id={`admin-line-${line.key}`}>
          {line.name} <small>{line.material === "acero" ? "Acero inoxidable" : "Plástico"}</small>
        </h2>
        <div className="table-wrap">
          <table className="steel-table admin-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {line.models.map((m) => (
                <ModelRow key={m.id} model={m} columns={columns} />
              ))}
              <NewModelRow line={line} columns={columns} />
            </tbody>
          </table>
        </div>
      </section>
    );
  });
}
