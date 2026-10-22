-- Da el rol de administrador a la cuenta de PRUEBA que usan los tests (Playwright).
-- Su email no recibe mails y la contraseña está solo en .env.local. Para quitárselo:
--   delete from public.admins where user_id = (select id from auth.users where email = 'admin-pruebas@hytank-next.vercel.app');
insert into public.admins (user_id)
select id from auth.users where email = 'admin-pruebas@hytank-next.vercel.app'
on conflict do nothing;
