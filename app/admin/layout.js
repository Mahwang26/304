import { redirect } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdminTabs from "./AdminTabs";
import { supabaseServer } from "../lib/supabaseServer";

export const metadata = { title: "Administración — 304" };

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#acero", label: "Acero Inoxidable" },
  { href: "/#plastico", label: "Plástico" },
];

// The admin panel. proxy.js already lets only administrators in; this checks again where the
// data is read, and the database's RLS has the last word.
export default async function AdminLayout({ children }) {
  const db = await supabaseServer();
  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) redirect("/sin-permiso");

  return (
    <div className="home-dark checkout admin">
      <Header navLinks={NAV_LINKS} />
      <main className="wrap checkout-wrap">
        <h1 className="checkout-title">Administración</h1>
        <AdminTabs />
        {children}
      </main>
      <Footer />
    </div>
  );
}
