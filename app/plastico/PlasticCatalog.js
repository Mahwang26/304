"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactCTA from "../components/ContactCTA";
import CatalogLineTable from "../components/CatalogLineTable";
import LineShowcase, { LineTabs } from "../components/LineShowcase";
import { PLASTIC_GROUP_INTROS } from "../lib/plasticPresentation";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#contacto", label: "Contacto" },
];

function plasticTabs(lines, lineKey) {
  return [
    { href: "/plastico", label: "Todas", current: !lineKey },
    ...lines.map((l) => ({ href: `/plastico/${l.key}`, label: l.name, current: l.key === lineKey })),
  ];
}

// Lines grouped by number of layers (their `quality`), keeping catalog order.
function groupByQuality(lines) {
  const groups = [];
  for (const line of lines) {
    let group = groups.find((g) => g.quality === line.quality);
    if (!group) groups.push((group = { quality: line.quality, lines: [] }));
    group.lines.push(line);
  }
  return groups;
}

// Plastic catalog. `lines` is every plastic line from the database. Without `lineKey` it is
// the full catalog; with it, only that line (as a presentation page when it has `showcase`).
export default function PlasticCatalog({ lines, lineKey }) {
  const line = lines.find((l) => l.key === lineKey);
  const tabs = plasticTabs(lines, lineKey);

  if (line?.showcase) {
    return (
      <LineShowcase
        line={line}
        kicker={line.showcase.kicker}
        tabs={tabs}
        tabsLabel="Líneas de plástico"
        navLinks={NAV_LINKS}
        installHref="/colocacion/plastico"
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
        <h1>{line ? `Tanques de Plástico ${line.name}` : "Tanques de Plástico"}</h1>
        <p>
          Polietileno tricapa y cuatricapa con protector UV8 y tratamiento
          antibacteriano, en versión clásica y XSlim para espacios reducidos.
          Todos requieren base de apoyo plana.
        </p>
        <p className="warranty-pill">
          <ShieldCheck size={20} weight="duotone" aria-hidden="true" />
          <span><strong>10 años</strong> de garantía, para intemperie/exterior y cisterna</span>
        </p>
        <LineTabs tabs={tabs} label="Líneas de plástico" />
      </div>
      <section className="section" id="productos">
        <div className="wrap">
          {groupByQuality(line ? [line] : lines).map((group) => (
            <div className="catalog-group" key={group.quality}>
              <div className="catalog-group-head">
                <h2>Tanques {group.quality.toLowerCase()}</h2>
                {PLASTIC_GROUP_INTROS[group.quality] && <p>{PLASTIC_GROUP_INTROS[group.quality]}</p>}
              </div>
              {group.lines.map((l) => (
                <CatalogLineTable key={l.key} line={l} />
              ))}
            </div>
          ))}
        </div>
      </section>
      <ContactCTA />
      <Footer />
    </>
  );
}
