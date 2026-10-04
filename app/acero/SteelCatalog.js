"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactCTA from "../components/ContactCTA";
import CatalogLineTable from "../components/CatalogLineTable";
import { STEEL_LINES } from "../lib/steelLines";

const LineTankViewer = dynamic(() => import("../components/LineTankViewer"), { ssr: false });

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/plastico", label: "Plástico" },
  { href: "/#contacto", label: "Contacto" },
];

function LineTabs({ lineKey }) {
  return (
    <nav className="line-tabs" aria-label="Líneas de acero">
      <Link href={lineKey ? "/#acero" : "/acero"} aria-current={lineKey ? undefined : "page"}>Todas</Link>
      {STEEL_LINES.map((l) => (
        <Link key={l.key} href={`/acero/${l.key}`} aria-current={l.key === lineKey ? "page" : undefined}>
          {l.name}
        </Link>
      ))}
    </nav>
  );
}

// Dark presentation page for a line that has `showcase` data: 3D tank on the left;
// title, description, warranty note and the models table on the right.
function LineShowcase({ line, addedIds, onAdd }) {
  const { lead, note, chips, tank } = line.showcase;
  return (
    <div className="home-dark line-dark">
      <Header cartCount={addedIds.length} navLinks={NAV_LINKS} />
      <main className="wrap line-wrap">
        <div className="line-topbar">
          <Link className="back-link" href="/">
            <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Volver al inicio
          </Link>
          <LineTabs lineKey={line.key} />
        </div>
        <div className="line-showcase">
          <div className="line-visual">
            <LineTankViewer tank={tank} />
            <p className="line-visual-hint" aria-hidden="true">Arrastrá para girar el tanque</p>
          </div>
          <div className="line-info">
            <p className="line-kicker">Línea de acero inoxidable</p>
            <h1 className="line-title">Modelo {line.name}</h1>
            <p className="line-lead">{lead}</p>
            <ul className="line-chips">
              {chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            {note && (
              <p className="line-note">
                <ShieldCheck size={18} weight="duotone" aria-hidden="true" />
                <span>{note}</span>
              </p>
            )}
            <h2 className="line-table-title">Modelos y precios</h2>
            <CatalogLineTable line={line} addedIds={addedIds} onAdd={onAdd} showHeading={false} />
          </div>
        </div>
      </main>
      <ContactCTA />
      <Footer />
    </div>
  );
}

// Steel catalog. Without `lineKey` it lists every line; with it, only that line's models.
export default function SteelCatalog({ lineKey }) {
  const [addedIds, setAddedIds] = useState([]);
  const line = STEEL_LINES.find((l) => l.key === lineKey);
  const lines = line ? [line] : STEEL_LINES;

  function handleAdd(key) {
    setAddedIds((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  if (line?.showcase) return <LineShowcase line={line} addedIds={addedIds} onAdd={handleAdd} />;

  return (
    <>
      <Header cartCount={addedIds.length} navLinks={NAV_LINKS} />
      <div className="wrap">
        <Link className="back-link" href="/">
          <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Volver al inicio
        </Link>
      </div>
      <div className="page-intro wrap">
        <h1>{line ? `Tanques de Acero ${line.name}` : "Tanques de Acero Inoxidable"}</h1>
        <p>
          {line
            ? `Fabricados en acero inoxidable AISI 304, antimagnético. ${line.models.length} modelos de la línea ${line.name}, según la capacidad que necesites.`
            : "Fabricados en acero inoxidable AISI 304, antimagnético. Tres líneas para cada tipo de instalación: a la intemperie, en espacios reducidos y con poca altura."}
        </p>
        <p className="warranty-pill">
          <ShieldCheck size={20} weight="duotone" aria-hidden="true" />
          <span><strong>40 años</strong> de garantía en todos los modelos</span>
        </p>
        <LineTabs lineKey={lineKey} />
      </div>
      <section className="section" id="productos">
        <div className="wrap">
          {lines.map((l) => (
            <CatalogLineTable key={l.key} line={l} addedIds={addedIds} onAdd={handleAdd} />
          ))}
        </div>
      </section>
      <ContactCTA />
      <Footer />
    </>
  );
}
