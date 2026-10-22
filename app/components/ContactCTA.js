// `inline` renders just the band, for placing it inside another column
// instead of as its own full-width page section.
export default function ContactCTA({ inline = false }) {
  const band = (
    <div className={"cta-band" + (inline ? " cta-band--inline" : "")} id={inline ? "contacto" : undefined}>
      <div>
        <h2>¿No sabés qué tanque necesitás?</h2>
        <p>Escribinos y te ayudamos a elegir el material y la capacidad justa para vos.</p>
      </div>
      <a
        className="btn-primary"
        href="https://wa.me/5491100000000"
        target="_blank"
        rel="noopener noreferrer"
      >
        Contactar por WhatsApp
      </a>
    </div>
  );
  if (inline) return band;
  return (
    <section className="section" id="contacto">
      <div className="wrap">{band}</div>
    </section>
  );
}
