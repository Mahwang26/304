const WARRANTY_NOTE =
  "10 años de garantía, tanto para uso a la intemperie/exterior como en cisterna. Requieren una base de apoyo plana.";

// Proportions of the 3D tank on each line's page: the classic body, or the narrow XSlim.
const CLASSIC_TANK = { kind: "plastic" };
const XSLIM_TANK = { kind: "plastic", radius: 0.6, bodyTop: 2.45, collarR: 0.4, labelHeight: 0.3 };

// What the site adds on top of each plastic line's catalog data, which lives in Supabase.
// Keyed by the line's `key` in the database. `callout` is the one-liner on the home hero;
// `showcase` is the line page's copy plus the proportions of its 3D tank.
export const PLASTIC_PRESENTATION = {
  plast3: {
    callout: "Tricapa clásico, con protector UV8 y antibacteriano.",
    showcase: {
      kicker: "Línea de plástico tricapa",
      lead: "Tanques clásicos tricapa con protector UV8 y antibacteriano, ideales para ubicar a la intemperie/exterior y en espacios cerrados.",
      note: WARRANTY_NOTE,
      chips: ["10 años de garantía", "Tricapa", "Protector UV8", "Antibacteriano"],
      tank: CLASSIC_TANK,
    },
  },
  "plast3-xslim": {
    callout: "Tricapa angosto, para espacios reducidos.",
    showcase: {
      kicker: "Línea de plástico tricapa",
      lead: "Tanques tricapa de diámetro angosto, pensados para espacios reducidos. Con protector UV8 y antibacteriano, para ubicar a la intemperie/exterior y en espacios cerrados.",
      note: WARRANTY_NOTE,
      chips: ["10 años de garantía", "Tricapa", "Diámetro angosto", "Protector UV8"],
      tank: XSLIM_TANK,
    },
  },
  plast4: {
    callout: "Cuatricapa clásico reforzado.",
    showcase: {
      kicker: "Línea de plástico cuatricapa",
      lead: "Tanques clásicos cuatricapa reforzados, con protector UV8 y antibacteriano, ideales para ubicar a la intemperie/exterior y en espacios cerrados.",
      note: WARRANTY_NOTE,
      chips: ["10 años de garantía", "Cuatricapa reforzado", "Protector UV8", "Antibacteriano"],
      tank: CLASSIC_TANK,
    },
  },
  "plast4-xslim": {
    callout: "Cuatricapa angosto y reforzado.",
    showcase: {
      kicker: "Línea de plástico cuatricapa",
      lead: "Tanques cuatricapa reforzados de diámetro angosto, pensados para espacios reducidos. Con protector UV8 y antibacteriano, para ubicar a la intemperie/exterior y en espacios cerrados.",
      note: WARRANTY_NOTE,
      chips: ["10 años de garantía", "Cuatricapa reforzado", "Diámetro angosto", "Protector UV8"],
      tank: XSLIM_TANK,
    },
  },
};

// The full plastic catalog groups lines by number of layers (their `quality` in the
// database); this is each group's intro line.
export const PLASTIC_GROUP_INTROS = {
  Tricapa: "Tres capas de polietileno con protector UV8 y tratamiento antibacteriano.",
  Cuatricapa: "Cuatro capas de polietileno: la estructura tricapa con una capa extra de refuerzo.",
};
