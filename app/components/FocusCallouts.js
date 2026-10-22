"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

// Fixed parts of each tank's close-up. `side` is where the card column sits: the empty
// side of the frame, opposite the tank.
const CALLOUT_SETS = {
  acero: { side: "right", badge: { value: "40", unit: "años de garantía", note: "Acero inoxidable AISI 304" } },
  plastico: { side: "left", badge: { value: "10", unit: "años de garantía", note: "Para intemperie/exterior y cisterna" } },
};

// Callout lines are this fraction of the default tank-to-column distance.
const LINE_SCALE = 0.75;

// HUD callouts for one tank's close-up: lines run from anchor points on the tank
// (projected by the 3D scene once the zoom settles) to a column of model cards.
// `items` are the cards, from the catalog: [{ key, href, name, range, desc }].
export default function FocusCallouts({ id, items, settled }) {
  const { side, badge } = CALLOUT_SETS[id];
  const active = settled?.id === id && !!settled.anchors;
  const column = useRef(null);
  const targets = useRef([]);
  const [lines, setLines] = useState([]);

  useLayoutEffect(() => {
    if (!active) return;
    const col = column.current;
    // `dir` is +1 when the column is to the right of the tank, -1 when it is to the left;
    // every horizontal step below is written once and mirrored through it.
    const dir = side === "right" ? 1 : -1;
    // Edge of the column that faces the tank. offset* ignores transforms (the `translate`
    // below and the cards' entry animation), so this is the untranslated resting position.
    const facingEdge = (el) => col.offsetLeft + el.offsetLeft + (dir === 1 ? 0 : el.offsetWidth) - dir * 8;
    // Pull the column toward the tank so the lines are LINE_SCALE of the default gap.
    const nearestAnchor = dir * Math.max(...settled.anchors.map(([ax]) => dir * ax));
    const gap = dir * (col.offsetLeft + (dir === 1 ? 0 : col.offsetWidth) - dir * 8 - nearestAnchor);
    const shift = gap > 0 ? -dir * gap * (1 - LINE_SCALE) : 0;
    col.style.translate = `${shift}px 0`;
    const next = settled.anchors
      .map(([ax, ay], i) => {
        const el = targets.current[i];
        if (!el) return null;
        const cx = facingEdge(el) + shift;
        const cy = col.offsetTop + el.offsetTop + el.offsetHeight / 2;
        const elbow = dir * Math.max(dir * (ax + dir * 40), dir * (cx - dir * 42));
        return {
          d: `M ${ax} ${ay} H ${ax + dir * 26} L ${elbow} ${cy} H ${cx}`,
          arrow: `M ${cx - dir * 7} ${cy - 4.5} L ${cx} ${cy} L ${cx - dir * 7} ${cy + 4.5}`,
          ax,
          ay,
        };
      })
      .filter(Boolean);
    setLines(next);
  }, [active, settled, side]);

  return (
    <div className={`callouts callouts--${side}` + (active ? " is-on" : "")} aria-hidden={!active}>
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
            <span className="callout-badge-value">{badge.value}</span>
            <span className="callout-badge-unit">{badge.unit}</span>
            <span className="callout-badge-note">{badge.note}</span>
          </div>
        </div>
        {items.map((it, j) => (
          <Link
            key={it.key}
            href={it.href}
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
