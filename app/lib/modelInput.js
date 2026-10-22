// Checks a catalog model sent to the admin API. Returns { value } with the clean columns, or
// { error } with a message for the administrator. `partial` (editing) accepts any subset of
// the fields; creating needs the required ones and a `line_key`.

const INT_FIELDS = {
  capacity_l: { label: "La capacidad", min: 1, max: 100000, required: true },
  height_cm: { label: "El alto", min: 1, max: 1000, required: true },
  diameter_cm: { label: "El diámetro", min: 1, max: 1000 },
  width_cm: { label: "El ancho", min: 1, max: 1000 },
  length_cm: { label: "El largo", min: 1, max: 1000 },
  price_ars: { label: "El precio", min: 1, max: 1_000_000_000, required: true },
  sort_order: { label: "El orden", min: 0, max: 1000 },
};

const TEXT_FIELDS = {
  model: { label: "El modelo", max: 20, required: true },
  outlet: { label: "La salida", max: 30, required: true },
};

export function parseModel(body, { partial = false } = {}) {
  if (!body || typeof body !== "object") return { error: "Faltan los datos del modelo." };
  const value = {};

  if (!partial) {
    if (typeof body.line_key !== "string" || !/^[a-z0-9-]{1,40}$/.test(body.line_key)) {
      return { error: "La línea no es válida." };
    }
    value.line_key = body.line_key;
  }

  for (const [key, rule] of Object.entries(TEXT_FIELDS)) {
    if (!(key in body)) {
      if (rule.required && !partial) return { error: `${rule.label} es obligatorio.` };
      continue;
    }
    const text = typeof body[key] === "string" ? body[key].trim() : "";
    if (!text) return { error: `${rule.label} es obligatorio.` };
    if (text.length > rule.max) return { error: `${rule.label} puede tener hasta ${rule.max} caracteres.` };
    value[key] = text;
  }

  for (const [key, rule] of Object.entries(INT_FIELDS)) {
    if (!(key in body)) {
      if (rule.required && !partial) return { error: `${rule.label} es obligatorio.` };
      continue;
    }
    const raw = body[key];
    if ((raw === null || raw === "") && !rule.required) {
      value[key] = null;
      continue;
    }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < rule.min || n > rule.max) {
      return { error: `${rule.label} tiene que ser un número entero entre ${rule.min} y ${rule.max.toLocaleString("es-AR")}.` };
    }
    value[key] = n;
  }

  if (partial && Object.keys(value).length === 0) return { error: "No hay nada para cambiar." };
  return { value };
}

// A Supabase/PostgREST error from a catalog write, as the HTTP answer for the administrator.
export function catalogWriteError(error) {
  if (error.code === "23505") return Response.json({ error: "Ya existe un modelo con ese nombre en esta línea." }, { status: 409 });
  if (error.code === "23503") return Response.json({ error: "Esa línea no existe." }, { status: 400 });
  if (error.code === "42501") return Response.json({ error: "No tenés permiso de administrador." }, { status: 403 });
  console.error("Catálogo, escritura:", error);
  return Response.json({ error: "No pudimos guardar el cambio. Probá de nuevo en unos minutos." }, { status: 500 });
}
