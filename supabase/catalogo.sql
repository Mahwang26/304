-- Catálogo del sitio 304: líneas de tanques y sus modelos.
-- Pegar completo en Supabase → SQL Editor → Run. Se puede volver a correr: borra y recrea las dos tablas.
-- Ojo: al recrearlas, los renglones de pedidos ya guardados dejan de apuntar a su modelo
-- (conservan igual la descripción y el precio con que se compraron).

drop table if exists public.models cascade;
drop table if exists public.lines cascade;

create table public.lines (
  key         text primary key,
  material    text not null check (material in ('acero', 'plastico')),
  name        text not null,
  description text not null,
  shape       text not null check (shape in ('vertical', 'horizontal')),
  quality     text not null,
  sort_order  integer not null
);

create table public.models (
  id          bigint generated always as identity primary key,
  line_key    text not null references public.lines (key) on delete cascade,
  model       text not null,
  capacity_l  integer not null,
  diameter_cm integer,
  width_cm    integer,
  height_cm   integer not null,
  length_cm   integer,
  outlet      text not null,
  price_ars   integer not null,
  sort_order  integer not null,
  unique (line_key, model)
);

-- El sitio solo lee. Cualquiera puede consultar el catálogo; nadie puede modificarlo con la clave pública.
alter table public.lines enable row level security;
alter table public.models enable row level security;
create policy "Lectura pública de líneas" on public.lines for select to anon, authenticated using (true);
create policy "Lectura pública de modelos" on public.models for select to anon, authenticated using (true);

insert into public.lines (key, material, name, description, shape, quality, sort_order) values
  ('classic', 'acero', 'Classic', 'Tanques clásicos con base plana, ideales para ubicar a la intemperie/exterior. No aptos para agua de pozo.', 'vertical', 'AISI 304', 1),
  ('horizonte', 'acero', 'Horizonte', 'Tanques horizontales con estructura incluida, para espacios con restricción de altura.', 'horizontal', 'AISI 304', 2),
  ('fino', 'acero', 'Fino', 'Tanques verticales de diámetro angosto, pensados para espacios reducidos.', 'vertical', 'AISI 304', 3),
  ('home-tower', 'acero', 'Tower', 'Tanque domiciliario elevado con base de acero inoxidable. Incluye base.', 'vertical', 'AISI 304', 4),
  ('plast3', 'plastico', 'Plast 3', 'Tanques clásicos tricapa con protector UV8 y antibacteriano, ideales para ubicar a la intemperie/exterior y en espacios cerrados.', 'vertical', 'Tricapa', 4),
  ('plast3-xslim', 'plastico', 'Plast 3 XSlim', 'Versión de diámetro angosto de la línea tricapa, pensada para espacios reducidos.', 'vertical', 'Tricapa', 5),
  ('plast4', 'plastico', 'Plast 4', 'Tanques clásicos cuatricapa reforzados, con protector UV8 y antibacteriano, ideales para ubicar a la intemperie/exterior y en espacios cerrados.', 'vertical', 'Cuatricapa', 6),
  ('plast4-xslim', 'plastico', 'Plast 4 XSlim', 'Versión de diámetro angosto de la línea cuatricapa, pensada para espacios reducidos.', 'vertical', 'Cuatricapa', 7);

insert into public.models (line_key, model, capacity_l, diameter_cm, width_cm, height_cm, length_cm, outlet, price_ars, sort_order) values
  ('classic', '500', 500, 97, null, 135, null, 'LAT 1.5"', 260000, 1),
  ('classic', '1000', 1000, 97, null, 195, null, 'LAT 1.5"', 520000, 2),
  ('classic', '1500', 1500, 122, null, 127, null, 'LAT 1.5"', 780000, 3),
  ('classic', '2000', 2000, 122, null, 187, null, 'LAT 1.5"', 1040000, 4),
  ('classic', '3000', 3000, 142, null, 198, null, 'LAT 2"', 1320000, 5),
  ('classic', '4000', 4000, 161, null, 197, null, 'LAT 2"', 1760000, 6),
  ('classic', '5000', 5000, 161, null, 247, null, 'LAT 2"', 1950000, 7),
  ('classic', '6000', 6000, 161, null, 306, null, 'LAT 2"', 2340000, 8),
  ('classic', '10000', 10000, 195, null, 340, null, 'LAT 2"', 3400000, 9),
  ('horizonte', '300', 300, null, 80, 80, 100, 'INF 1"', 293000, 1),
  ('horizonte', '1000', 1000, null, 103, 115, 150, 'INF 1.5"', 806000, 2),
  ('horizonte', '3000', 3000, null, 143, 170, 234, 'INF 2"', 1716000, 3),
  ('horizonte', '6000', 6000, null, 166, 195, 310, 'INF 2"', 3042000, 4),
  ('fino', '75', 75, 45, null, 53, null, '—', 81000, 1),
  ('fino', '300', 300, 63, null, 102, null, 'LAT 1"', 270000, 2),
  ('fino', '500', 500, 71, null, 135, null, 'LAT 1"', 450000, 3),
  ('fino', '1500', 1500, 97, null, 199, null, 'LAT 1.5"', 936000, 4),
  ('fino', '2000', 2000, 97, null, 247, null, 'LAT 1.5"', 1248000, 5),
  ('home-tower', '500', 500, 97, null, 135, null, 'INF 1.5"', 475981, 1),
  ('home-tower', '1000', 1000, 97, null, 195, null, 'INF 1.5"', 637144, 2),
  ('plast3', '300', 300, 62, null, 114, null, 'LAT 1½"', 52000, 1),
  ('plast3', '500', 500, 90, null, 100, null, 'LAT 1½"', 68000, 2),
  ('plast3', '750', 750, 100, null, 117, null, 'LAT 1½"', 92000, 3),
  ('plast3', '1000', 1000, 100, null, 147, null, 'LAT 1½"', 115000, 4),
  ('plast3', '2000', 2000, 140, null, 165, null, 'LAT 1½"', 215000, 5),
  ('plast3', '2500', 2500, 140, null, 201, null, 'LAT 1½"', 262000, 6),
  ('plast3', '3300', 3300, 140, null, 250, null, 'LAT 1½"', 340000, 7),
  ('plast3-xslim', '500', 500, 62, null, 169, null, 'LAT 1½"', 75000, 1),
  ('plast3-xslim', '750', 750, 75, null, 171, null, 'LAT 1½"', 101000, 2),
  ('plast3-xslim', '1500', 1500, 101, null, 215, null, 'LAT 1½"', 172000, 3),
  ('plast4', '300', 300, 62, null, 114, null, 'LAT 1½"', 61000, 1),
  ('plast4', '500', 500, 90, null, 100, null, 'LAT 1½"', 80000, 2),
  ('plast4', '750', 750, 100, null, 117, null, 'LAT 1½"', 108000, 3),
  ('plast4', '1000', 1000, 100, null, 147, null, 'LAT 1½"', 136000, 4),
  ('plast4', '2000', 2000, 140, null, 165, null, 'LAT 1½"', 254000, 5),
  ('plast4', '2500', 2500, 140, null, 201, null, 'LAT 1½"', 309000, 6),
  ('plast4', '3300', 3300, 140, null, 250, null, 'LAT 1½"', 401000, 7),
  ('plast4-xslim', '500', 500, 62, null, 169, null, 'LAT 1½"', 88000, 1),
  ('plast4-xslim', '750', 750, 75, null, 171, null, 'LAT 1½"', 119000, 2),
  ('plast4-xslim', '1500', 1500, 101, null, 215, null, 'LAT 1½"', 203000, 3);
