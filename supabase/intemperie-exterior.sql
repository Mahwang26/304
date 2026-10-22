-- Agrega "/exterior" después de "intemperie" en las descripciones de las líneas.
-- Pegar en Supabase → SQL Editor → Run. Se puede correr más de una vez.
update public.lines
set description = replace(description, 'intemperie', 'intemperie/exterior')
where description like '%intemperie%' and description not like '%intemperie/exterior%';
