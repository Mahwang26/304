import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ContactCTA from "../../components/ContactCTA";
import { LineTabs } from "../../components/LineShowcase";
import InstallLabel, { SteelInstallLabel } from "../../components/InstallLabel";
import { getCatalog } from "../../lib/catalog";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#plastico", label: "Plástico" },
];

// One tab per material: its installation notice (the label printed on the tanks).
const MATERIALS = {
  acero: {
    tab: "Acero inoxidable",
    title: "Colocación de tanques de acero inoxidable",
    lead: "Cómo instalar un tanque de acero inoxidable 304 para que funcione bien durante años y conserve sus 40 años de garantía.",
    catalog: { href: "/#acero", label: "Ver los tanques de acero" },
    Label: SteelInstallLabel,
  },
  plastico: {
    tab: "Plástico",
    title: "Colocación de tanques de plástico",
    lead: "Cómo instalar un tanque de plástico tricapa o cuatricapa para que funcione bien y conserve sus 10 años de garantía, a la intemperie/exterior o en cisterna.",
    catalog: { href: "/#plastico", label: "Ver los tanques de plástico" },
    Label: InstallLabel,
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(MATERIALS).map((material) => ({ material }));
}

export async function generateMetadata({ params }) {
  const { material } = await params;
  return { title: `${MATERIALS[material]?.title ?? "Colocación"} — 304` };
}

export default async function InstallationPage({ params }) {
  const { material } = await params;
  const page = MATERIALS[material];
  if (!page) notFound();

  const catalog = await getCatalog();
  const lines = (material === "acero" ? catalog.steel : catalog.plastic).map((l) => l.name);
  const tabs = Object.entries(MATERIALS).map(([key, m]) => ({
    href: `/colocacion/${key}`,
    label: m.tab,
    current: key === material,
  }));
  const { Label } = page;

  return (
    <div className="home-dark line-dark">
      <Header navLinks={NAV_LINKS} />
      <main className="wrap line-wrap">
        <div className="line-topbar">
          <Link className="back-link" href="/">
            <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Volver al inicio
          </Link>
          <LineTabs tabs={tabs} label="Colocación por material" />
        </div>
        <div className="install-page">
          <div className="install-page-info">
            <p className="line-kicker">Colocación</p>
            <h1 className="line-title install-page-title">{page.title}</h1>
            <p className="line-lead">{page.lead}</p>
            <p className="install-page-lines">
              Vale para las líneas <strong>{lines.join(", ")}</strong>.
            </p>
            <Link className="install-page-link" href={page.catalog.href}>
              {page.catalog.label} <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </Link>
            <ContactCTA inline />
          </div>
          <Label />
        </div>
      </main>
      <Footer />
    </div>
  );
}
