-- Da el rol de administrador a una cuenta del sitio. La cuenta tiene que existir: creala
-- antes en /cuenta. Cambiá el email por el de esa cuenta y corré esto en Supabase → SQL Editor.
insert into public.admins (user_id)
select id from auth.users where email = 'CAMBIAR-POR-TU-EMAIL@gmail.com'
on conflict do nothing;

-- Para ver quiénes son administradores:
--   select u.email from public.admins a join auth.users u on u.id = a.user_id;
-- Para quitarle el rol a una cuenta:
--   delete from public.admins where user_id = (select id from auth.users where email = 'EMAIL');
