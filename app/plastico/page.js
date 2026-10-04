"use client";

import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactCTA from "../components/ContactCTA";
import CatalogLineTable from "../components/CatalogLineTable";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#contacto", label: "Contacto" },
];

const OUTLET = "LAT 1½\"";

// Líneas y medidas replicadas del catálogo de tanques plásticos de referencia
// (affinity.com.ar/tanques-de-plasticos). Los precios son estimativos: la página
// de referencia no publica precios.
const PLASTIC_GROUPS = [
  {
    key: "tricapa",
    title: "Tanques tricapa",
    intro: "Tres capas de polietileno con protector UV8 y tratamiento antibacteriano.",
    lines: [
      {
        key: "plast3",
        name: "Plast 3",
        desc: "Tanques clásicos tricapa con protector UV8 y antibacteriano, ideales para ubicar a la intemperie y en espacios cerrados.",
        shape: "vertical",
        models: [
          { model: "300", cap: 300, diam: 62, height: 114, outlet: OUTLET, price: 52000 },
          { model: "500", cap: 500, diam: 90, height: 100, outlet: OUTLET, price: 68000 },
          { model: "750", cap: 750, diam: 100, height: 117, outlet: OUTLET, price: 92000 },
          { model: "1000", cap: 1000, diam: 100, height: 147, outlet: OUTLET, price: 115000 },
          { model: "2000", cap: 2000, diam: 140, height: 165, outlet: OUTLET, price: 215000 },
          { model: "2500", cap: 2500, diam: 140, height: 201, outlet: OUTLET, price: 262000 },
          { model: "3300", cap: 3300, diam: 140, height: 250, outlet: OUTLET, price: 340000 },
        ],
      },
      {
        key: "plast3-xslim",
        name: "Plast 3 XSlim",
        desc: "Versión de diámetro angosto de la línea tricapa, pensada para espacios reducidos.",
        shape: "vertical",
        models: [
          { model: "500", cap: 500, diam: 62, height: 169, outlet: OUTLET, price: 75000 },
          { model: "750", cap: 750, diam: 75, height: 171, outlet: OUTLET, price: 101000 },
          { model: "1500", cap: 1500, diam: 101, height: 215, outlet: OUTLET, price: 172000 },
        ],
      },
    ],
  },
  {
    key: "cuatricapa",
    title: "Tanques cuatricapa",
    intro: "Cuatro capas de polietileno: la estructura tricapa con una capa extra de refuerzo.",
    lines: [
      {
        key: "plast4",
        name: "Plast 4",
        desc: "Tanques clásicos cuatricapa reforzados, con protector UV8 y antibacteriano, ideales para ubicar a la intemperie y en espacios cerrados.",
        shape: "vertical",
        models: [
          { model: "300", cap: 300, diam: 62, height: 114, outlet: OUTLET, price: 61000 },
          { model: "500", cap: 500, diam: 90, height: 100, outlet: OUTLET, price: 80000 },
          { model: "750", cap: 750, diam: 100, height: 117, outlet: OUTLET, price: 108000 },
          { model: "1000", cap: 1000, diam: 100, height: 147, outlet: OUTLET, price: 136000 },
          { model: "2000", cap: 2000, diam: 140, height: 165, outlet: OUTLET, price: 254000 },
          { model: "2500", cap: 2500, diam: 140, height: 201, outlet: OUTLET, price: 309000 },
          { model: "3300", cap: 3300, diam: 140, height: 250, outlet: OUTLET, price: 401000 },
        ],
      },
      {
        key: "plast4-xslim",
        name: "Plast 4 XSlim",
        desc: "Versión de diámetro angosto de la línea cuatricapa, pensada para espacios reducidos.",
        shape: "vertical",
        models: [
          { model: "500", cap: 500, diam: 62, height: 169, outlet: OUTLET, price: 88000 },
          { model: "750", cap: 750, diam: 75, height: 171, outlet: OUTLET, price: 119000 },
          { model: "1500", cap: 1500, diam: 101, height: 215, outlet: OUTLET, price: 203000 },
        ],
      },
    ],
  },
];

export default function PlasticoPage() {
  const [addedIds, setAddedIds] = useState([]);

  function handleAdd(key) {
    setAddedIds((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  return (
    <>
      <Header cartCount={addedIds.length} navLinks={NAV_LINKS} />
      <div className="wrap">
        <a className="back-link" href="/">
          <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Volver al inicio
        </a>
      </div>
      <div className="page-intro wrap">
        <h1>Tanques de Plástico</h1>
        <p>
          Polietileno tricapa y cuatricapa con protector UV8 y tratamiento
          antibacteriano, en versión clásica y XSlim para espacios reducidos.
          Todos requieren base de apoyo plana.
        </p>
      </div>
      <section className="section" id="productos">
        <div className="wrap">
          {PLASTIC_GROUPS.map((group) => (
            <div className="catalog-group" key={group.key}>
              <div className="catalog-group-head">
                <h2>{group.title}</h2>
                <p>{group.intro}</p>
              </div>
              {group.lines.map((line) => (
                <CatalogLineTable key={line.key} line={line} addedIds={addedIds} onAdd={handleAdd} />
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
