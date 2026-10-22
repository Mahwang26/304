-- Agrega la línea Tower al catálogo. Pegar en Supabase → SQL Editor → Run (una sola vez).
-- Precios sin IVA, tomados de la lista de precios.

insert into public.lines (key, material, name, description, shape, quality, sort_order) values
  ('home-tower', 'acero', 'Tower', 'Tanque domiciliario elevado con base de acero inoxidable. Incluye base.', 'vertical', 'AISI 304', 4);

insert into public.models (line_key, model, capacity_l, diameter_cm, width_cm, height_cm, length_cm, outlet, price_ars, sort_order) values
  ('home-tower', '500', 500, 97, null, 135, null, 'INF 1.5"', 475981, 1),
  ('home-tower', '1000', 1000, 97, null, 195, null, 'INF 1.5"', 637144, 2);
