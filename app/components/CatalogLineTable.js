"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import QuantityStepper from "./QuantityStepper";
import { formatARS } from "../lib/format";

// Choose how many, then add them to the cart (on top of what is already there).
function AddToCart({ model, name }) {
  const { qtyOf, setQty } = useCart();
  const [qty, setLocalQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const add = () => {
    setQty(model.id, qtyOf(model.id) + qty, { name, cap: model.cap, price: model.price });
    setLocalQty(1);
    setAdded(true);
  };

  return (
    <span className="add-to-cart">
      <QuantityStepper qty={qty} name={name} onChange={setLocalQty} removable={false} />
      <button className={`add-btn${added ? " added" : ""}`} onClick={add} aria-label={`Agregar ${qty} ${name} al carrito`}>
        {added ? "Agregado" : "Agregar"}
      </button>
    </span>
  );
}

// A line's models with their sizes and prices. The last column picks a quantity and
// adds the model to the cart.
export default function CatalogLineTable({ line, showHeading = true }) {
  const horizontal = line.shape === "horizontal";
  return (
    <div className="line-section" id={line.key}>
      {showHeading && (
        <>
          <h2>{line.name}</h2>
          <p className="line-desc">{line.desc}</p>
        </>
      )}
      <div className="table-wrap">
        <table className="steel-table">
          <thead>
            <tr>
              <th>Modelo</th>
              {line.quality && <th>Calidad</th>}
              <th>Capacidad</th>
              {horizontal ? (
                <>
                  <th>Ancho (cm)</th>
                  <th>Alto (cm)</th>
                  <th>Largo (cm)</th>
                </>
              ) : (
                <>
                  <th>Diámetro (cm)</th>
                  <th>Alto (cm)</th>
                </>
              )}
              <th>Salida</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {line.models.map((m) => {
              const name = `${line.name} ${m.model}`;
              return (
                <tr key={m.id}>
                  <td>{name}</td>
                  {line.quality && <td>{line.quality}</td>}
                  <td>{m.cap.toLocaleString("es-AR")} L</td>
                  {horizontal ? (
                    <>
                      <td>{m.width}</td>
                      <td>{m.height}</td>
                      <td>{m.length}</td>
                    </>
                  ) : (
                    <>
                      <td>{m.diam}</td>
                      <td>{m.height}</td>
                    </>
                  )}
                  <td>{m.outlet}</td>
                  <td className="price-cell">{formatARS(m.price)}</td>
                  <td className="cart-cell">
                    <AddToCart model={m} name={name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
