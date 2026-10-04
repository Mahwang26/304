export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>© {new Date().getFullYear()} 304 — Todos los derechos reservados.</span>
        <span>Hecho con React + Next.js para la facultad</span>
      </div>
    </footer>
  );
}
