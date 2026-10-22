import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Factory, Truck, Wrench, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactCTA from "./components/ContactCTA";
import TankHero from "./components/TankHero";
import { getCatalog } from "./lib/catalog";
import { capacityRange } from "./lib/format";

const NAV_LINKS = [
  { href: "/plastico", label: "Plástico" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#beneficios", label: "Beneficios" },
  { href: "/#contacto", label: "Contacto" },
];

// Card pictures in public/tanks, rendered from each line's 3D tank: [width, height].
const TANK_IMAGE_SIZE = {
  classic: [628, 1156],
  horizonte: [628, 628],
  fino: [628, 1156],
  "home-tower": [628, 1156],
  plast3: [628, 1156],
  "plast3-xslim": [628, 1156],
  plast4: [628, 1156],
  "plast4-xslim": [628, 1156],
};

// Model cards on the hero close-ups: the lines the site has a one-liner for.
function calloutItems(lines, basePath) {
  return lines
    .filter((l) => l.callout)
    .map((l) => ({ key: l.key, href: `${basePath}/${l.key}`, name: l.name, range: capacityRange(l.models, " – "), desc: l.callout }));
}

// A material's section: one rounded-square card per line that has a picture; each card
// opens that line's page. `detail` is the small text under the line's name.
function ModelSection({ id, title, intro, lines, basePath, altPrefix, detail }) {
  return (
    <section className="section" id={id}>
      <div className="wrap">
        <div className="section-head">
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
        <div className="model-grid">
          {lines.filter((line) => TANK_IMAGE_SIZE[line.key]).map((line) => {
            const [w, h] = TANK_IMAGE_SIZE[line.key];
            return (
              <Link key={line.key} href={`${basePath}/${line.key}`} className="model-card">
                <Image
                  src={`/tanks/${line.key}.png`}
                  alt={`${altPrefix} ${line.name}`}
                  width={w}
                  height={h}
                  sizes="(max-width: 820px) 70vw, 300px"
                />
                <span className="model-card-text">
                  <strong>{line.name}</strong>
                  <small>{detail(line)}</small>
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

export default async function Home() {
  const { steel, plastic } = await getCatalog();
  const ranges = {
    acero: capacityRange(steel.flatMap((l) => l.models)),
    plastico: capacityRange(plastic.flatMap((l) => l.models)),
  };
  const callouts = { acero: calloutItems(steel, "/acero"), plastico: calloutItems(plastic, "/plastico") };
  return (
    <div className="home-dark">
      <Header navLinks={NAV_LINKS} />
      <TankHero ranges={ranges} callouts={callouts} />
      <ModelSection
        id="acero"
        title="Tanques de Acero Inoxidable"
        intro="Acero AISI 304 antimagnético, con 40 años de garantía. Elegí un modelo para ver sus capacidades y precios."
        lines={steel}
        basePath="/acero"
        altPrefix="Tanque de acero inoxidable"
        detail={(line) => capacityRange(line.models)}
      />
      <ModelSection
        id="plastico"
        title="Tanques de Plástico"
        intro="Polietileno tricapa y cuatricapa, con 10 años de garantía. Elegí un modelo para ver sus capacidades y precios."
        lines={plastic}
        basePath="/plastico"
        altPrefix="Tanque de plástico"
        detail={(line) => `${line.quality} · ${capacityRange(line.models)}`}
      />
      <Features />
      <HowToBuy />
      <ContactCTA />
      <Footer />
    </div>
  );
}
