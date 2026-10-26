-- Consulta de diagnóstico: ejecutar en Supabase SQL Editor.
-- El resultado muestra los permisos de lectura de la web y los registros
-- existentes/publicados. No modifica ningún dato.
SELECT
  tabla,
  has_table_privilege('anon', 'public.' || tabla, 'SELECT') AS lectura_visitantes,
  has_table_privilege('authenticated', 'public.' || tabla, 'SELECT') AS lectura_usuarios,
  registros,
  publicados
FROM (
  SELECT 'productos' AS tabla, count(*) AS registros,
    count(*) FILTER (WHERE activo) AS publicados FROM public.productos
  UNION ALL SELECT 'cursos', count(*), count(*) FILTER (WHERE activo) FROM public.cursos
  UNION ALL SELECT 'servicios', count(*), count(*) FILTER (WHERE activo) FROM public.servicios
  UNION ALL SELECT 'kits', count(*), count(*) FILTER (WHERE activo) FROM public.kits
  UNION ALL SELECT 'categorias', count(*), count(*) FILTER (WHERE activo) FROM public.categorias
  UNION ALL SELECT 'marcas', count(*), count(*) FILTER (WHERE activo) FROM public.marcas
) AS diagnostico;
