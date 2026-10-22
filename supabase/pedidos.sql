-- Pedidos del sitio 304: datos del comprador y los productos de cada compra.
-- Pegar completo en Supabase → SQL Editor → Run. Se puede volver a correr sin perder pedidos.

create table if not exists public.orders (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  status        text not null default 'nuevo',
  customer_name text not null,
  phone         text not null,
  email         text not null,
  address       text not null,
  city          text not null,
  province      text not null,
  notes         text,
  total_ars     bigint not null
);

-- Cada renglón guarda el nombre y el precio del momento de la compra, así el pedido
-- no cambia si después se edita o se borra el modelo del catálogo.
create table if not exists public.order_items (
  id             bigint generated always as identity primary key,
  order_id       bigint not null references public.orders (id) on delete cascade,
  model_id       bigint references public.models (id) on delete set null,
  description    text not null,
  quantity       integer not null check (quantity between 1 and 99),
  unit_price_ars integer not null
);

-- Sin políticas: con la clave pública nadie puede leer ni modificar pedidos.
-- Se ven solo desde el panel de Supabase.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Única puerta de entrada desde el sitio. Recibe los datos del comprador y la lista de
-- { model_id, quantity }; los precios se toman del catálogo, no de lo que mande el navegador.
create or replace function public.create_order(customer jsonb, items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name     text := btrim(coalesce(customer->>'name', ''));
  v_phone    text := btrim(coalesce(customer->>'phone', ''));
  v_email    text := btrim(coalesce(customer->>'email', ''));
  v_address  text := btrim(coalesce(customer->>'address', ''));
  v_city     text := btrim(coalesce(customer->>'city', ''));
  v_province text := btrim(coalesce(customer->>'province', ''));
  v_notes    text := nullif(btrim(coalesce(customer->>'notes', '')), '');
  v_order_id bigint;
  v_total    bigint := 0;
  v_item     jsonb;
  v_qty      integer;
  v_model    record;
begin
  if v_name = '' or v_phone = '' or v_email = '' or v_address = '' or v_city = '' or v_province = '' then
    raise exception 'Faltan datos del comprador.';
  end if;
  if position('@' in v_email) < 2 then
    raise exception 'El email no es válido.';
  end if;
  if greatest(length(v_name), length(v_phone), length(v_email), length(v_address), length(v_city), length(v_province)) > 200
     or length(coalesce(v_notes, '')) > 1000 then
    raise exception 'Alguno de los datos es demasiado largo.';
  end if;
  if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items) = 0 then
    raise exception 'El pedido no tiene productos.';
  end if;
  if jsonb_array_length(items) > 50 then
    raise exception 'El pedido tiene demasiados productos.';
  end if;

  insert into public.orders (customer_name, phone, email, address, city, province, notes, total_ars)
  values (v_name, v_phone, v_email, v_address, v_city, v_province, v_notes, 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'La cantidad de uno de los productos no es válida.';
    end if;

    select m.id, m.model, m.price_ars, l.name as line_name
      into v_model
      from public.models m
      join public.lines l on l.key = m.line_key
     where m.id = (v_item->>'model_id')::bigint;
    if not found then
      raise exception 'Uno de los productos ya no está disponible.';
    end if;

    insert into public.order_items (order_id, model_id, description, quantity, unit_price_ars)
    values (v_order_id, v_model.id, v_model.line_name || ' ' || v_model.model, v_qty, v_model.price_ars);
    v_total := v_total + v_qty::bigint * v_model.price_ars;
  end loop;

  update public.orders set total_ars = v_total where id = v_order_id;
  return jsonb_build_object('order_id', v_order_id, 'total_ars', v_total);
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
