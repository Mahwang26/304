import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Factory, Truck, Wrench, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactCTA from "./components/ContactCTA";
import TankHero from "./components/TankHero";
import { STEEL_LINES } from "./lib/steelLines";

const NAV_LINKS = [
  { href: "/plastico", label: "Plástico" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#beneficios", label: "Beneficios" },
  { href: "/#contacto", label: "Contacto" },
];

const TANK_IMAGE_SIZE = { classic: [628, 1156], horizonte: [628, 628], fino: [628, 1156] };

function formatRange(models) {
  const caps = models.map((m) => m.cap);
  const fmt = (n) => n.toLocaleString("es-AR");
  return `${fmt(Math.min(...caps))} a ${fmt(Math.max(...caps))} L`;
}

// One rounded-square card per steel line; each opens that line's page.
function SteelSection() {
  return (
    <section className="section" id="acero">
      <div className="wrap">
        <div className="section-head">
          <h2>Tanques de Acero Inoxidable</h2>
          <p>Acero AISI 304 antimagnético, con 40 años de garantía. Elegí un modelo para ver sus capacidades y precios.</p>
        </div>
        <div className="model-grid">
          {STEEL_LINES.map((line) => {
            const [w, h] = TANK_IMAGE_SIZE[line.key];
            return (
              <Link key={line.key} href={`/acero/${line.key}`} className="model-card">
                <Image
                  src={`/tanks/${line.key}.png`}
                  alt={`Tanque de acero inoxidable ${line.name}`}
                  width={w}
                  height={h}
                  sizes="(max-width: 820px) 70vw, 300px"
                />
                <span className="model-card-text">
                  <strong>{line.name}</strong>
                  <small>{formatRange(line.models)}</small>
                </span>
                <span className="model-card-cta">
                  Ver modelos <ArrowRight size={15} weight="bold" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Heading only for now: the plastic models will be added here later.
function PlasticSection() {
  return (
    <section className="section" id="plastico">
      <div className="wrap">
        <div className="section-head">
          <h2>Tanques de Plástico</h2>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { Icon: ShieldCheck, title: "Garantía extendida", text: "Contra fallas de fabricación en todos nuestros modelos." },
    { Icon: Factory, title: "Dos materiales", text: "Polietileno o acero inoxidable AISI 304, según tu necesidad." },
    { Icon: Truck, title: "Envío a todo el país", text: "Entrega en 24/48hs en CABA y GBA, resto del país a coordinar." },
    { Icon: Wrench, title: "Instalación incluida", text: "Te ayudamos a instalarlo y sellarlo en tu domicilio." },
  ];
  return (
    <section className="section" id="beneficios">
      <div className="wrap">
        <div className="section-head">
          <h2>Por qué elegir 304</h2>
          <p>Más de 15 años proveyendo soluciones de almacenamiento de agua en Argentina.</p>
        </div>
        <div className="features">
          {items.map(({ Icon, title, text }) => (
            <div className="feature" key={title}>
              <div className="ico">
                <Icon size={22} weight="bold" aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowToBuy() {
  const steps = [
    { title: "Elegí el material", text: "Comparás plástico y acero inoxidable y ves el catálogo completo de cada uno." },
    { title: "Coordiná el envío", text: "Te contactamos para definir fecha, dirección y método de pago." },
    { title: "Recibí e instalá", text: "Nuestro equipo te asiste en la instalación y puesta en funcionamiento." },
  ];
  return (
    <section className="section" id="como-comprar">
      <div className="wrap">
        <div className="section-head">
          <h2>Cómo comprar</h2>
          <p>Todo el proceso en tres pasos simples.</p>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={s.title}>
              <div className="num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="home-dark">
      <Header navLinks={NAV_LINKS} />
      <TankHero />
      <SteelSection />
      <PlasticSection />
      <Features />
      <HowToBuy />
      <ContactCTA />
      <Footer />
    </div>
  );
}
