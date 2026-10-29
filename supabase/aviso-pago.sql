-- Aviso por mail de los pagos aprobados: record_payment ahora devuelve, además del estado,
-- si el pedido quedó pagado recién ahora y sus datos, para que el sitio mande UN solo mail
-- a 304 aunque Mercado Pago avise varias veces del mismo pago.
-- Pegar completo en Supabase → SQL Editor → Run. Se puede volver a correr.

drop function if exists public.record_payment(text, bigint, text, text, numeric);

create function public.record_payment(
  p_secret text, p_order_id bigint, p_payment_id text, p_status text, p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order  record;
  v_status text := p_status;
  v_items  jsonb;
begin
  if p_secret is null or p_secret is distinct from (select value from private.settings where key = 'payments_secret') then
    raise exception 'No autorizado.';
  end if;
  if p_status not in ('pendiente', 'aprobado', 'rechazado', 'devuelto') then
    raise exception 'Estado de pago desconocido.';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('status', 'pedido inexistente', 'newly_paid', false);
  end if;

  -- Un intento fallido posterior no deshace un pago que ya se acreditó.
  if v_order.payment_status = 'aprobado' and p_payment_id is distinct from v_order.mp_payment_id then
    return jsonb_build_object('status', v_order.payment_status, 'newly_paid', false);
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

  -- Recién pagado: hasta ahora no estaba aprobado. Es el único caso en que se avisa por mail.
  if v_status = 'aprobado' and v_order.payment_status is distinct from 'aprobado' then
    select coalesce(jsonb_agg(jsonb_build_object(
             'description', i.description, 'quantity', i.quantity, 'unit_price_ars', i.unit_price_ars
           ) order by i.id), '[]'::jsonb)
      into v_items
      from public.order_items i
     where i.order_id = p_order_id;

    return jsonb_build_object(
      'status', v_status,
      'newly_paid', true,
      'order', jsonb_build_object(
        'id', v_order.id, 'created_at', v_order.created_at, 'total_ars', v_order.total_ars,
        'customer_name', v_order.customer_name, 'phone', v_order.phone, 'email', v_order.email,
        'address', v_order.address, 'city', v_order.city, 'province', v_order.province,
        'notes', v_order.notes, 'items', v_items
      )
    );
  end if;
  return jsonb_build_object('status', v_status, 'newly_paid', false);
end;
$$;

revoke all on function public.record_payment(text, bigint, text, text, numeric) from public;
grant execute on function public.record_payment(text, bigint, text, text, numeric) to anon, authenticated;
