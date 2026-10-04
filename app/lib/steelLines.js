// Líneas y medidas replicadas del catálogo de acero inoxidable AISI 304
// de referencia (affinity.com.ar/tanques-de-acero). Los precios son
// estimativos: la página de referencia no publica precios.
export const STEEL_LINES = [
  {
    key: "classic",
    name: "Classic",
    desc: "Tanques clásicos con base plana, ideales para ubicar a la intemperie. No aptos para agua de pozo.",
    shape: "vertical",
    quality: "AISI 304",
    // Presentation page (/acero/classic): copy plus the proportions of its 3D tank.
    showcase: {
      lead: "Tanques clásicos con base plana, ideales para ubicar a la intemperie en edificios y casas grandes. Fabricados en acero inoxidable AISI 304 antimagnético. No aptos para agua de pozo.",
      note: "La garantía se limita exclusivamente a aplicaciones en intemperie y al almacenamiento de agua potable.",
      chips: ["40 años de garantía", "AISI 304 antimagnético", "Base plana", "Para intemperie"],
      tank: { bodyTop: 2.35, bands: [0.2, 0.59, 0.98, 1.37, 1.76, 2.15], labelBand: 4 },
    },
    models: [
      { model: "1500", cap: 1500, diam: 122, height: 127, outlet: "LAT 1.5\"", price: 780000 },
      { model: "2000", cap: 2000, diam: 122, height: 187, outlet: "LAT 1.5\"", price: 1040000 },
      { model: "3000", cap: 3000, diam: 142, height: 198, outlet: "LAT 2\"", price: 1320000 },
      { model: "4000", cap: 4000, diam: 161, height: 197, outlet: "LAT 2\"", price: 1760000 },
      { model: "5000", cap: 5000, diam: 161, height: 247, outlet: "LAT 2\"", price: 1950000 },
      { model: "6000", cap: 6000, diam: 161, height: 306, outlet: "LAT 2\"", price: 2340000 },
      { model: "10000", cap: 10000, diam: 195, height: 340, outlet: "LAT 2\"", price: 3400000 },
    ],
  },
  {
    key: "horizonte",
    name: "Horizonte",
    desc: "Tanques horizontales con estructura incluida, para espacios con restricción de altura.",
    quality: "AISI 304",
    shape: "horizontal",
    showcase: {
      lead: "Tanques horizontales con estructura de soporte incluida, pensados para espacios con restricción de altura. Fabricados en acero inoxidable AISI 304 antimagnético.",
      chips: ["40 años de garantía", "AISI 304 antimagnético", "Estructura incluida", "Para poca altura"],
      tank: { kind: "horizontal" },
    },
    models: [
      { model: "300", cap: 300, width: 80, height: 80, length: 100, outlet: "INF 1\"", price: 293000 },
      { model: "1000", cap: 1000, width: 103, height: 115, length: 150, outlet: "INF 1.5\"", price: 806000 },
      { model: "3000", cap: 3000, width: 143, height: 170, length: 234, outlet: "INF 2\"", price: 1716000 },
      { model: "6000", cap: 6000, width: 166, height: 195, length: 310, outlet: "INF 2\"", price: 3042000 },
    ],
  },
  {
    key: "fino",
    name: "Fino",
    desc: "Tanques verticales de diámetro angosto, pensados para espacios reducidos.",
    quality: "AISI 304",
    shape: "vertical",
    showcase: {
      lead: "Tanques verticales de diámetro angosto, ideales para ubicar a la intemperie y pasar por espacios chicos. Fabricados en acero inoxidable AISI 304 antimagnético. No aptos para agua de pozo.",
      chips: ["40 años de garantía", "AISI 304 antimagnético", "Diámetro angosto", "Para intemperie"],
      // Same model as Classic, a little narrower.
      tank: { radius: 0.66, bodyTop: 2.35, bands: [0.2, 0.59, 0.98, 1.37, 1.76, 2.15], labelBand: 4 },
    },
    models: [
      { model: "75", cap: 75, diam: 45, height: 53, outlet: "—", price: 81000 },
      { model: "300", cap: 300, diam: 63, height: 102, outlet: "LAT 1\"", price: 270000 },
      { model: "500", cap: 500, diam: 71, height: 135, outlet: "LAT 1\"", price: 450000 },
      { model: "1500", cap: 1500, diam: 97, height: 199, outlet: "LAT 1.5\"", price: 936000 },
      { model: "2000", cap: 2000, diam: 97, height: 247, outlet: "LAT 1.5\"", price: 1248000 },
    ],
  },
];
