-- Pagos con Mercado Pago: el estado del pago de cada pedido y la función con la que el sitio
-- lo registra cuando Mercado Pago avisa. Pegar completo en Supabase → SQL Editor → Run.
-- Se puede volver a correr. Después correr también supabase/secreto-pagos.sql (no está en git).

alter table public.orders add column if not exists payment_status text not null default 'sin_pagar';
alter table public.orders add column if not exists mp_payment_id text;
alter table public.orders add column if not exists paid_at timestamptz;

-- Datos internos que el sitio no puede leer: el esquema "private" no está publicado en la API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.settings (
  key   text primary key,
  value text not null
);

-- La llama solo el servidor del sitio, después de consultar el pago en Mercado Pago, y con
-- la clave secreta de pagos: sin ella nadie puede marcar un pedido como pagado.
create or replace function public.record_payment(
  p_secret text, p_order_id bigint, p_payment_id text, p_status text, p_amount numeric
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order  record;
  v_status text := p_status;
begin
  if p_secret is null or p_secret is distinct from (select value from private.settings where key = 'payments_secret') then
    raise exception 'No autorizado.';
  end if;
  if p_status not in ('pendiente', 'aprobado', 'rechazado', 'devuelto') then
    raise exception 'Estado de pago desconocido.';
  end if;

  select id, total_ars, payment_status, mp_payment_id
    into v_order
    from public.orders
   where id = p_order_id
     for update;
  if not found then
    return 'pedido inexistente';
  end if;

  -- Un intento fallido posterior no deshace un pago que ya se acreditó.
  if v_order.payment_status = 'aprobado' and p_payment_id is distinct from v_order.mp_payment_id then
    return v_order.payment_status;
  end if;
  -- Solo cuenta como pagado si se pagó el total del pedido.
  if v_status = 'aprobado' and p_amount < v_order.total_ars then
    v_status := 'monto_incorrecto';
  end if;

  update public.orders
     set payment_status = v_status,
         mp_payment_id  = p_payment_id,
         paid_at        = case when v_status = 'aprobado' then coalesce(paid_at, now()) else paid_at end
   where id = p_order_id;
  return v_status;
end;
$$;

revoke all on function public.record_payment(text, bigint, text, text, numeric) from public;
grant execute on function public.record_payment(text, bigint, text, text, numeric) to anon, authenticated;
