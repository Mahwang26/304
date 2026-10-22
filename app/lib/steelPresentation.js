// What the site adds on top of each steel line's catalog data, which lives in Supabase.
// Keyed by the line's `key` in the database. `callout` is the one-liner on the home hero;
// `showcase` is the line page's copy plus the proportions of its 3D tank.
export const STEEL_PRESENTATION = {
  classic: {
    callout: "Base plana, ideal para ubicar a la intemperie/exterior.",
    showcase: {
      lead: "Tanques clásicos con base plana, ideales para ubicar a la intemperie/exterior en edificios y casas grandes. Fabricados en acero inoxidable AISI 304 antimagnético. No aptos para agua de pozo.",
      note: "La garantía se limita exclusivamente a aplicaciones en intemperie/exterior y al almacenamiento de agua potable.",
      chips: ["40 años de garantía", "AISI 304 antimagnético", "Base plana", "Para intemperie/exterior"],
      tank: { bodyTop: 2.35, bands: [0.2, 0.59, 0.98, 1.37, 1.76, 2.15], labelBand: 4 },
    },
  },
  horizonte: {
    callout: "Horizontal, para espacios con poca altura.",
    showcase: {
      lead: "Tanques horizontales con estructura de soporte incluida, pensados para espacios con restricción de altura. Fabricados en acero inoxidable AISI 304 antimagnético.",
      chips: ["40 años de garantía", "AISI 304 antimagnético", "Estructura incluida", "Para poca altura"],
      tank: { kind: "horizontal" },
    },
  },
  fino: {
    callout: "Diámetro angosto para espacios reducidos.",
    showcase: {
      lead: "Tanques verticales de diámetro angosto, ideales para ubicar a la intemperie/exterior y pasar por espacios chicos. Fabricados en acero inoxidable AISI 304 antimagnético. No aptos para agua de pozo.",
      chips: ["40 años de garantía", "AISI 304 antimagnético", "Diámetro angosto", "Para intemperie/exterior"],
      // Same model as Classic, a little narrower.
      tank: { radius: 0.66, bodyTop: 2.35, bands: [0.2, 0.59, 0.98, 1.37, 1.76, 2.15], labelBand: 4 },
    },
  },
  "home-tower": {
    callout: "Domiciliario elevado, con base incluida.",
    showcase: {
      lead: "Tanque domiciliario elevado, con base de acero inoxidable incluida. Fabricado en acero inoxidable AISI 304 antimagnético.",
      note: "Adicional por modificación de diámetro o ubicación de la salida: $59.950 sin IVA. Los precios de esta línea son sin IVA.",
      chips: ["40 años de garantía", "AISI 304 antimagnético", "Base incluida", "Uso domiciliario"],
      tank: { kind: "tower", bodyTop: 1.3, bands: [0.2, 0.55, 0.9], labelBand: 1 },
    },
  },
};
