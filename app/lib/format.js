export function formatARS(n) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

// Smallest to largest capacity among `models`, e.g. "1.500 a 10.000 L".
export function capacityRange(models, separator = " a ") {
  const caps = models.map((m) => m.cap);
  const fmt = (n) => n.toLocaleString("es-AR");
  return `${fmt(Math.min(...caps))}${separator}${fmt(Math.max(...caps))} L`;
}
