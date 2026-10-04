import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { formatARS } from "../lib/format";

export default function CatalogLineTable({ line, addedIds, onAdd, showHeading = true }) {
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
              const key = `${line.key}-${m.model}`;
              const added = addedIds.includes(key);
              return (
                <tr key={key}>
                  <td>{line.name} {m.model}</td>
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
                  <td>
                    <button className={"add-btn" + (added ? " added" : "")} onClick={() => onAdd(key)}>
                      {added ? (
                        <>
                          Agregado <CheckCircle size={16} weight="bold" aria-hidden="true" />
                        </>
                      ) : (
                        "Agregar"
                      )}
                    </button>
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
