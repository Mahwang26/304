import { Rubik, Nunito_Sans, Inter_Tight } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import CartProvider from "./components/CartProvider";
import { getCatalog } from "./lib/catalog";

// Neo-grotesque for the hero's titanium title.
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "304 — Tanques de agua",
  description: "304 — Tanques de agua de plástico y acero inoxidable para hogares, negocios y campo.",
};

export default async function RootLayout({ children }) {
  const { steel, plastic } = await getCatalog();
  // The line of every model, by model id: the cart uses it to pick each tank's picture.
  const lineOf = {};
  for (const line of [...steel, ...plastic]) {
    for (const m of line.models) lineOf[m.id] = line.key;
  }
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${rubik.variable} ${nunitoSans.variable} ${interTight.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider lineOf={lineOf}>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
