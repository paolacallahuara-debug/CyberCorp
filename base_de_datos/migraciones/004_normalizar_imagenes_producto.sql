-- ============================================================
-- 004 · NORMALIZAR IMÁGENES DE PRODUCTOS
-- ============================================================
-- Este script es opcional y seguro para instalaciones antiguas que hayan
-- agregado una columna productos.imagen_url. Copia esas URLs a la tabla
-- normalizada imagenes_producto sin eliminar la columna antigua.
--
-- Revísalo antes de ejecutarlo en producción.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'productos'
      AND column_name = 'imagen_url'
  ) THEN
    INSERT INTO public.imagenes_producto (producto_id, url, es_principal, orden)
    SELECT p.id, p.imagen_url, TRUE, 0
    FROM public.productos p
    WHERE p.imagen_url IS NOT NULL
      AND BTRIM(p.imagen_url) <> ''
      AND NOT EXISTS (
        SELECT 1
        FROM public.imagenes_producto i
        WHERE i.producto_id = p.id
          AND i.es_principal = TRUE
      );
  END IF;
END $$;
