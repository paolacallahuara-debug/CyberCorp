-- ============================================================
-- 005 · SUPABASE STORAGE PARA IMÁGENES DEL CATÁLOGO
-- ============================================================
-- Crea un bucket público para productos, cursos, servicios y promociones.
-- Los visitantes pueden leer imágenes; solo administradores activos pueden
-- subir, reemplazar o eliminar objetos mediante la API autenticada.

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'imagenes-publicas',
    'imagenes-publicas',
    TRUE,
    8388608,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Publico puede leer imagenes catalogo" ON storage.objects;
CREATE POLICY "Publico puede leer imagenes catalogo"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'imagenes-publicas');

DROP POLICY IF EXISTS "Administradores pueden subir imagenes catalogo" ON storage.objects;
CREATE POLICY "Administradores pueden subir imagenes catalogo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'imagenes-publicas'
    AND public.es_administrador()
);

DROP POLICY IF EXISTS "Administradores pueden actualizar imagenes catalogo" ON storage.objects;
CREATE POLICY "Administradores pueden actualizar imagenes catalogo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'imagenes-publicas'
    AND public.es_administrador()
)
WITH CHECK (
    bucket_id = 'imagenes-publicas'
    AND public.es_administrador()
);

DROP POLICY IF EXISTS "Administradores pueden eliminar imagenes catalogo" ON storage.objects;
CREATE POLICY "Administradores pueden eliminar imagenes catalogo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'imagenes-publicas'
    AND public.es_administrador()
);
