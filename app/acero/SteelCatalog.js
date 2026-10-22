"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactCTA from "../components/ContactCTA";
import CatalogLineTable from "../components/CatalogLineTable";
import LineShowcase, { LineTabs } from "../components/LineShowcase";
import { SteelInstallLabel } from "../components/InstallLabel";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/plastico", label: "Plástico" },
  { href: "/#contacto", label: "Contacto" },
];

// "Todas" is the steel section of the home page, except on the all-lines page itself.
function steelTabs(lines, lineKey) {
  return [
    { href: lineKey ? "/#acero" : "/acero", label: "Todas", current: !lineKey },
    ...lines.map((l) => ({ href: `/acero/${l.key}`, label: l.name, current: l.key === lineKey })),
  ];
}

// Steel catalog. `lines` is every steel line from the database. Without `lineKey` it lists
// them all; with it, only that line (as a presentation page when the line has `showcase`).
export default function SteelCatalog({ lines, lineKey }) {
  const line = lines.find((l) => l.key === lineKey);
  const shown = line ? [line] : lines;
  const tabs = steelTabs(lines, lineKey);

  if (line?.showcase) {
    return (
      <LineShowcase
        line={line}
        kicker="Línea de acero inoxidable"
        tabs={tabs}
        tabsLabel="Líneas de acero"
        navLinks={NAV_LINKS}
        label={<SteelInstallLabel />}
      />
    );
  }

  return (
    <>
      <Header navLinks={NAV_LINKS} />
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
            : "Fabricados en acero inoxidable AISI 304, antimagnético. Líneas para cada tipo de instalación: a la intemperie/exterior, en espacios reducidos y con poca altura."}
        </p>
        <p className="warranty-pill">
          <ShieldCheck size={20} weight="duotone" aria-hidden="true" />
          <span><strong>40 años</strong> de garantía en todos los modelos</span>
        </p>
        <LineTabs tabs={tabs} label="Líneas de acero" />
      </div>
      <section className="section" id="productos">
        <div className="wrap">
          {shown.map((l) => (
            <CatalogLineTable key={l.key} line={l} />
          ))}
        </div>
      </section>
      <ContactCTA />
      <Footer />
    </>
  );
}
