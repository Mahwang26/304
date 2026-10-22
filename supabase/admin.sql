-- Rol de administrador: quién lo tiene, qué puede hacer (editar el catálogo y los pedidos) y
-- las reglas de seguridad (RLS) que lo hacen cumplir en la base, no solo en el sitio.
-- Pegar completo en Supabase → SQL Editor → Run. Se puede volver a correr.
-- Para darle el rol a una cuenta, después correr supabase/hacer-admin.sql.

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
-- Nadie la lee ni la escribe desde el sitio: se administra solo desde el panel de Supabase.
alter table public.admins enable row level security;

-- ¿La cuenta que hace la consulta es administradora?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Estados posibles de un pedido (la entrega; el pago va aparte, en payment_status).
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('nuevo', 'en_preparacion', 'enviado', 'entregado', 'cancelado'));

-- Catálogo: todos lo leen (ya estaba); solo un administrador crea, edita o borra modelos y líneas.
grant insert, update, delete on public.models, public.lines to authenticated;

drop policy if exists "Administradores crean modelos" on public.models;
create policy "Administradores crean modelos" on public.models
  for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "Administradores editan modelos" on public.models;
create policy "Administradores editan modelos" on public.models
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Administradores borran modelos" on public.models;
create policy "Administradores borran modelos" on public.models
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Administradores editan líneas" on public.lines;
create policy "Administradores editan líneas" on public.lines
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Pedidos: un administrador ve todos y puede cambiar SOLO su estado de entrega.
revoke update on public.orders from anon, authenticated;
grant update (status) on public.orders to authenticated;

drop policy if exists "Administradores ven todos los pedidos" on public.orders;
create policy "Administradores ven todos los pedidos" on public.orders
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "Administradores cambian el estado de los pedidos" on public.orders;
create policy "Administradores cambian el estado de los pedidos" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Administradores ven los productos de todos los pedidos" on public.order_items;
create policy "Administradores ven los productos de todos los pedidos" on public.order_items
  for select to authenticated using ((select public.is_admin()));
