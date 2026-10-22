import { Warning } from "@phosphor-icons/react/dist/ssr";

// Exploded view from the tank's label: tank, (a) intermediate base, (b) octagonal base, (c) level rails.
function SupportDiagram() {
  const octagon = [
    [94, 150.6], [80, 157.1], [60, 157.1], [46, 150.6], [46, 141.4], [60, 134.9], [80, 134.9], [94, 141.4],
  ];
  return (
    <svg className="install-label-diagram" viewBox="0 0 140 204" role="img" aria-label="Tanque apoyado sobre (a) base intermedia, (b) base octogonal y (c) superficie nivelada">
      <g fill="#fff" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M38 36 Q38 26 70 26 Q102 26 102 36 L102 82 Q102 94 70 94 Q38 94 38 82 Z" />
        <path d="M38 38 Q70 50 102 38" fill="none" strokeWidth="1.4" />
        <rect x="84" y="9" width="9" height="8" rx="1.5" />
        <ellipse cx="70" cy="17" rx="20" ry="9" />
        <ellipse cx="70" cy="17" rx="13" ry="5.5" />
        <path d="M57 17 H83 M70 11.5 V22.5" strokeWidth="1.6" />

        <path d="M36 112 v4 a34 12 0 0 0 68 0 v-4" />
        <ellipse cx="70" cy="112" rx="34" ry="12" />

        <polygon points={octagon.map((p) => p.join(",")).join(" ")} />
        {octagon.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M70 146 L${x} ${y}`} strokeWidth="1.5" />
        ))}
        <ellipse cx="70" cy="146" rx="6.5" ry="3.2" />

        <path d="M40 170 L84 192 L90 188 L46 166 Z" />
        <path d="M78 162 L122 184 L128 180 L84 158 Z" />
      </g>
      <g fill="currentColor" fontSize="15" fontWeight="700" fontFamily="inherit">
        <text x="6" y="117">(a)</text>
        <text x="14" y="151">(b)</text>
        <text x="112" y="201">(c)</text>
      </g>
    </svg>
  );
}

// Shared frame of the printed installation notices: header band, the vertical
// "do not remove" line along the edge, the body, and the warranty warning at the foot.
function LabelShell({ variant, titleId, children }) {
  return (
    <aside className={`install-label install-label--${variant}`} aria-labelledby={titleId}>
      <div className="install-label-head">
        <h2 id={titleId}>Importante</h2>
      </div>
      <p className="install-label-side">No remover etiqueta, será requerida ante cualquier reclamo</p>
      <div className="install-label-body">
        {children}
        <p className="install-label-warning">
          <Warning size={38} weight="bold" aria-hidden="true" />
          <span>Ante incumplimiento de los ítems especificados se anula validez de la garantía.</span>
        </p>
      </div>
    </aside>
  );
}

// The notice printed on the plastic tanks, rebuilt as a card:
// same wording and order as the physical label.
export default function InstallLabel() {
  return (
    <LabelShell variant="plastic" titleId="install-label-plastic">
      <p className="install-label-intro">La correcta instalación garantiza el producto</p>

      <h3>1. No realizar perforaciones</h3>
      <p>No efectuar agujeros extras en el fondo y/o laterales del tanque.</p>

      <h3>2. Conexiones</h3>
      <p>
        Evite pérdidas. Al conectar la cañería del colector a la cupla de salida del tanque,
        sopórtela con una herramienta para evitar torsiones. Utilizar sellador
      </p>

      <h3>3. Instalación sobre superficie plana</h3>
      <p>Apoyar sobre suelo plano y nivelado. Evitar contacto con elementos punzantes.</p>

      <h3>4. Instalación sobre mampostería o perfilería</h3>
      <div className="install-label-fig">
        <div>
          <p>
            La correcta instalación requiere de bases de apoyo para evitar posibles fatigas del
            material. El fondo del tanque debe estar apoyado sobre un plano en la totalidad de su
            superficie.
            <br />
            Ver imagen:
          </p>
          <ul>
            <li><strong>a)</strong> Base intermedia (Fibrocemento, Madera, Plast)</li>
            <li><strong>b)</strong> Base octogonal de caño reforzado</li>
            <li><strong>c)</strong> Superficie de apoyo nivelado</li>
          </ul>
        </div>
        <SupportDiagram />
      </div>

      <p className="install-label-contact">Ante cualquier duda, comuníquese con el servicio técnico.</p>
    </LabelShell>
  );
}

// Cross-section from the steel label: (a) inlet extension, (b) maximum water level,
// (c) discharge below the surface.
function FloatDiagram() {
  return (
    <svg className="install-label-diagram" viewBox="0 0 120 102" role="img" aria-label="Corte del tanque: (a) silenciador, (b) nivel máximo de agua, (c) descarga dentro del agua">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 96 V28 Q12 8 34 8 H86 Q108 8 108 28 V96" />
        <path d="M6 96 H114" strokeWidth="3" />
        {[36, 70].flatMap((y) => [9, 105].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="6" height="5" fill="#fff" strokeWidth="1.5" />))}
        <path d="M12 42 H108" strokeWidth="1.2" strokeDasharray="4 3" />
        <rect x="43" y="4" width="10" height="7" fill="#fff" />
        <path d="M48 11 V54" strokeWidth="3" />
        <path d="M48 17 L82 23" />
        <circle cx="90" cy="25" r="9" fill="#fff" />
        <path d="M48 62 V86 M43 80 L48 87 L53 80" strokeWidth="2.4" />
      </g>
      <g fill="currentColor" fontSize="13" fontWeight="700" fontFamily="inherit">
        <text x="20" y="34">(a)</text>
        <text x="62" y="60">(b)</text>
        <text x="60" y="90">(c)</text>
      </g>
    </svg>
  );
}

// Tank resting on support profiles, with the spacing printed on the label.
// `halves` is one shell outline per drawn piece; `feet` are [x1, x2] spans; `dims` are [x, text].
function ProfilesDiagram({ width, halves, bands, feet, dims, centerLine, label }) {
  return (
    <svg className="install-label-diagram" viewBox={`0 0 ${width} 66`} role="img" aria-label={label}>
      <g fill="#fff" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        {halves.map((d) => <path key={d} d={d} />)}
        {bands.flatMap(([x1, x2]) => [9, 12, 32, 35].map((y) => <path key={`${x1}-${y}`} d={`M${x1} ${y} H${x2}`} strokeWidth="1" />))}
        {feet.map(([x1, x2]) => <path key={x1} d={`M${x1} 49 V41 H${x2} V49`} fill="none" strokeWidth="2.6" />)}
        {centerLine && <path d={`M${centerLine} 0 V52`} strokeWidth="1" strokeDasharray="5 2 1 2" />}
      </g>
      <g fill="currentColor" fontSize="10.5" fontWeight="600" fontFamily="inherit" textAnchor="middle">
        {dims.map(([x, text]) => <text key={x} x={x} y="63">{text}</text>)}
      </g>
    </svg>
  );
}

// The notice printed on the stainless-steel tanks: same wording and order as the label.
export function SteelInstallLabel() {
  return (
    <LabelShell variant="steel" titleId="install-label-steel">
      <p className="install-label-intro">La correcta instalación es la garantía misma del producto.</p>

      <h3>1. Colocación de flotante con silenciador</h3>
      <p>
        El ingreso del agua al tanque debe efectuarse por debajo del nivel del flotante. Evite
        posible corrosión por elementos externos
      </p>
      <div className="install-label-fig">
        <ul>
          <li><strong>a) Silenciador:</strong> Extensión de la entrada de agua.</li>
          <li><strong>b) Nivel máximo de agua</strong></li>
          <li><strong>c) Descarga de agua dentro de masa existente.</strong></li>
        </ul>
        <FloatDiagram />
      </div>

      <h3>2. Apoyo del tanque</h3>
      <p><strong>(i) Apoyo sobre plano:</strong> Apoye sobre suelo nivelado en toda su base.</p>
      <p className="install-label-gap">
        <strong>(ii) Apoyo sobre perfiles:</strong> Utilizar perfiles de 140 o 160mm. Evite corrosión
        galvánica pintando estos con convertidor de óxido, pintura epoxy y elemento aislante
        (membrana, madera, goma, etc.)
      </p>
      <div className="install-label-profiles">
        <ProfilesDiagram
          width={92}
          halves={["M4 4 H88 V40 H4 Z"]}
          bands={[[4, 88]]}
          feet={[[14, 30], [62, 78]]}
          dims={[[22, "15"], [46, "50"], [70, "15"]]}
          centerLine={46}
          label="Tanque sobre 2 perfiles: 15, 50, 15"
        />
        <ProfilesDiagram
          width={150}
          halves={["M4 4 H70 L66 13 L74 22 L66 31 L70 40 H4 Z", "M80 4 H146 V40 H80 L76 31 L84 22 L76 13 Z"]}
          bands={[[4, 67], [83, 146]]}
          feet={[[15.6, 33.1], [50.6, 66], [84, 99.4], [116.9, 134.4]]}
          dims={[[9.8, "10"], [24.3, "15"], [41.8, "15"], [59, "15"], [91, "15"], [108.2, "15"], [125.7, "15"], [140.4, "10"]]}
          label="Tanque sobre varios perfiles: 10, 15, 15, 15 de cada lado"
        />
      </div>
      <ul className="install-label-plain">
        <li>Tanque de 1000lts. 2 perfiles</li>
        <li>Tanque 1500 a 3000 lts. 4 perfiles,</li>
        <li>Tanque 4000 a 7000lts. 6 perfiles.</li>
      </ul>

      <h3>3. Materiales no compatibles</h3>
      <p>
        Evitar uso de materiales férricos no inoxidables o galvanizados. Utilizar conexiones
        plásticas, acero inoxidable o bronce.
      </p>

      <h3>4. Instalación en ambiente cerrado</h3>
      <p>
        Asegurar una correcta ventilación, natural o forzada, para evitar acumulación de gas de
        cloro dentro del tanque por evaporación del agua.
      </p>

      <h3>5. Mantenimiento</h3>
      <p>
        Hacer mantenimiento del tanque cada 6 meses, en caso de detectar principios de óxido limpiar
        con esponja de acero inoxidable y CIF. No utilizar lavandina (Cloro). Tanques incendio:
        Evitar estancamiento de agua por más de 30 días.
      </p>

      <p className="install-label-inline">
        <strong>6. Agua de pozo:</strong> No utilizar para aguas de pozo o no potables, realizar
        estudio de agua para ver compatibilidad con acero inoxidable AISI304
      </p>
    </LabelShell>
  );
}
