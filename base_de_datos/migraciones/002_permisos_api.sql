-- CyberCorp: reparar "permission denied for table productos" en la Data API.
-- Ejecutar UNA VEZ en Supabase > SQL Editor, conectado al proyecto correcto.
-- No modifica ni elimina filas. Aplica permisos solo a las tablas de tablas_referencia.txt.
-- Las políticas RLS del esquema original siguen decidiendo qué filas ve/cambia cada rol.

BEGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Quitar privilegios anteriores de estos dos roles para dejar un acceso explícito.
REVOKE ALL ON TABLE
  public.administradores,
  public.categorias,
  public.marcas,
  public.productos,
  public.imagenes_producto,
  public.kits,
  public.kit_productos,
  public.servicios,
  public.cursos,
  public.configuracion_empresa
FROM anon, authenticated;

-- La tienda (sin iniciar sesión) puede consultar las filas que permita RLS.
GRANT SELECT ON TABLE
  public.categorias,
  public.marcas,
  public.productos,
  public.imagenes_producto,
  public.kits,
  public.kit_productos,
  public.servicios,
  public.cursos,
  public.configuracion_empresa
TO anon, authenticated;

-- El perfil del administrador nunca se publica a visitantes anónimos.
GRANT SELECT ON TABLE public.administradores TO authenticated;

-- El panel puede intentar editar; las políticas RLS existentes exigen
-- public.es_administrador() y deniegan escrituras al resto de usuarios.
GRANT INSERT, UPDATE, DELETE ON TABLE
  public.categorias,
  public.marcas,
  public.productos,
  public.imagenes_producto,
  public.kits,
  public.kit_productos,
  public.servicios,
  public.cursos,
  public.configuracion_empresa
TO authenticated;

-- Las categorías y marcas utilizan identificadores identity.
DO $$
DECLARE
  secuencia TEXT;
BEGIN
  secuencia := pg_get_serial_sequence('public.categorias', 'id');
  IF secuencia IS NOT NULL THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE ' || secuencia || ' TO authenticated';
  END IF;
  secuencia := pg_get_serial_sequence('public.marcas', 'id');
  IF secuencia IS NOT NULL THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE ' || secuencia || ' TO authenticated';
  END IF;
END $$;

-- Mantener RLS como barrera obligatoria en todas las tablas expuestas.
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagenes_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_empresa ENABLE ROW LEVEL SECURITY;

COMMIT;
