-- Cambia el nombre de la línea "Home Tower" a "Tower". Pegar en Supabase → SQL Editor → Run.
update public.lines set name = 'Tower' where key = 'home-tower';
