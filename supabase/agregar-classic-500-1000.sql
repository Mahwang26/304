-- Agrega los modelos Classic 500 y Classic 1000, con el diámetro y el alto del Tower.
-- Pegar en Supabase → SQL Editor → Run. Se puede correr más de una vez sin duplicar nada.
-- Los precios son estimados (misma escala que el resto de la línea Classic): cambiarlos acá
-- antes de correrlo, o después desde Table Editor → models.

-- Corre los modelos actuales dos lugares para que 500 y 1000 queden primeros en la tabla.
update public.models set sort_order = sort_order + 2
where line_key = 'classic'
  and not exists (select 1 from public.models where line_key = 'classic' and model = '500');

insert into public.models (line_key, model, capacity_l, diameter_cm, width_cm, height_cm, length_cm, outlet, price_ars, sort_order) values
  ('classic', '500', 500, 97, null, 135, null, 'LAT 1.5"', 260000, 1),
  ('classic', '1000', 1000, 97, null, 195, null, 'LAT 1.5"', 520000, 2)
on conflict (line_key, model) do nothing;
