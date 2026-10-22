import { Minus, Plus, Trash } from "@phosphor-icons/react/dist/ssr";

// − n + quantity control. At 1, the minus button becomes "remove"; with `removable`
// off (choosing how many to add) it is disabled there instead.
export default function QuantityStepper({ qty, name, onChange, removable = true }) {
  const removes = removable && qty === 1;
  return (
    <span className="qty-stepper">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={!removable && qty <= 1}
        aria-label={removes ? `Quitar ${name}` : `Restar un ${name}`}
      >
        {removes ? <Trash size={15} weight="bold" aria-hidden="true" /> : <Minus size={15} weight="bold" aria-hidden="true" />}
      </button>
      <span className="qty-stepper-value" aria-label={`Cantidad: ${qty}`}>{qty}</span>
      <button type="button" onClick={() => onChange(qty + 1)} disabled={qty >= 99} aria-label={`Sumar un ${name}`}>
        <Plus size={15} weight="bold" aria-hidden="true" />
      </button>
    </span>
  );
}
