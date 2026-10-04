"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

const STEEL_ITEMS = [
  { key: "classic", name: "Classic", range: "1.500 – 10.000 L", desc: "Base plana, ideal para ubicar a la intemperie." },
  { key: "horizonte", name: "Horizonte", range: "300 – 6.000 L", desc: "Horizontal, para espacios con poca altura." },
  { key: "fino", name: "Fino", range: "75 – 2.000 L", desc: "Diámetro angosto para espacios reducidos." },
];

// Callout lines are this fraction of the default tank-to-column distance.
const LINE_SCALE = 0.75;

// HUD callouts for the steel close-up: lines run from anchor points on the tank
// (projected by the 3D scene once the zoom settles) to a column of cards on the right.
export default function FocusCallouts({ settled }) {
  const active = settled?.id === "acero" && !!settled.anchors;
  const column = useRef(null);
  const targets = useRef([]);
  const [lines, setLines] = useState([]);

  useLayoutEffect(() => {
    if (!active) return;
    const col = column.current;
    // Pull the card column toward the tank so the lines are LINE_SCALE of the default gap.
    // offset* ignores transforms (the `translate` below and the cards' entry animation),
    // so measurements always refer to the column's untranslated resting position.
    const rightmostAnchor = Math.max(...settled.anchors.map(([ax]) => ax));
    const gap = col.offsetLeft - 8 - rightmostAnchor;
    const shift = gap > 0 ? -gap * (1 - LINE_SCALE) : 0;
    col.style.translate = `${shift}px 0`;
    const next = settled.anchors
      .map(([ax, ay], i) => {
        const el = targets.current[i];
        if (!el) return null;
        const cx = col.offsetLeft + el.offsetLeft - 8 + shift;
        const cy = col.offsetTop + el.offsetTop + el.offsetHeight / 2;
        const ex = Math.max(ax + 40, cx - 42);
        return {
          d: `M ${ax} ${ay} H ${ax + 26} L ${ex} ${cy} H ${cx}`,
          arrow: `M ${cx - 7} ${cy - 4.5} L ${cx} ${cy} L ${cx - 7} ${cy + 4.5}`,
          ax,
          ay,
        };
      })
      .filter(Boolean);
    setLines(next);
  }, [active, settled]);

  return (
    <div className={"callouts" + (active ? " is-on" : "")} aria-hidden={!active}>
      <svg className="callout-lines" width="100%" height="100%">
        {lines.map((l, i) => (
          <g key={i} style={{ "--i": i + 1 }}>
            <path d={l.d} pathLength="1" className="callout-line" />
            <path d={l.arrow} className="callout-arrow" />
            <circle cx={l.ax} cy={l.ay} r="3.5" className="callout-ring" />
            <circle cx={l.ax} cy={l.ay} r="3" className="callout-dot" />
          </g>
        ))}
      </svg>

      <div className="callout-column" ref={column}>
        {/* The warranty badge has no line: anchors map one-to-one to the model cards. */}
        <div className="callout-badge" style={{ "--i": 0 }}>
          <ShieldCheck size={30} weight="duotone" aria-hidden="true" />
          <div>
            <span className="callout-badge-value">40</span>
            <span className="callout-badge-unit">años de garantía</span>
            <span className="callout-badge-note">Acero inoxidable AISI 304</span>
          </div>
        </div>
        {STEEL_ITEMS.map((it, j) => (
          <Link
            key={it.key}
            href={`/acero/${it.key}`}
            className="callout-card"
            ref={(el) => { targets.current[j] = el; }}
            style={{ "--i": j + 1 }}
            tabIndex={active ? 0 : -1}
          >
            <span className="callout-card-head">
              <span className="callout-index">{String(j + 1).padStart(2, "0")}</span>
              <strong>{it.name}</strong>
              <span className="callout-range">{it.range}</span>
            </span>
            <span className="callout-desc">{it.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
