"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Header from "./Header";
import Footer from "./Footer";
import ContactCTA from "./ContactCTA";
import CatalogLineTable from "./CatalogLineTable";

const LineTankViewer = dynamic(() => import("./LineTankViewer"), { ssr: false });

// Pills to jump between the lines of one material. `tabs` is [{ href, label, current }].
export function LineTabs({ tabs, label }) {
  return (
    <nav className="line-tabs" aria-label={label}>
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} aria-current={t.current ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

// Dark presentation page for a line with `showcase` data: 3D tank on the left;
// title, description, warranty note and the models table on the right.
// `installHref`: the page with how to install this kind of tank, linked under the tank.
export default function LineShowcase({ line, kicker, tabs, tabsLabel, navLinks, installHref }) {
  const { lead, note, chips, tank } = line.showcase;
  return (
    <div className="home-dark line-dark">
      <Header navLinks={navLinks} />
      <main className="wrap line-wrap">
        <div className="line-topbar">
          <Link className="back-link" href="/">
            <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Volver al inicio
          </Link>
          <LineTabs tabs={tabs} label={tabsLabel} />
        </div>
        <div className="line-showcase">
          <div className="line-visual">
            <LineTankViewer tank={tank} />
            <p className="line-visual-hint" aria-hidden="true">Arrastrá para girar el tanque</p>
            {installHref && (
              <Link className="line-install-link" href={installHref}>
                Cómo se coloca este tanque <ArrowRight size={15} weight="bold" aria-hidden="true" />
              </Link>
            )}
          </div>
          <div className="line-info">
            <p className="line-kicker">{kicker}</p>
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
            <CatalogLineTable line={line} showHeading={false} />
            <ContactCTA inline />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
