# Base de datos de CyberCorp

CyberCorp trabaja únicamente con Supabase.

## Si la base ya existe

No vuelvas a ejecutar todo `tablas_referencia.txt` sobre una base con datos. Utiliza las migraciones necesarias.

Para esta versión debes ejecutar:

```text
migraciones/006_contenido_institucional_testimonios.sql
```

Este script agrega:

- `cursos.fecha_inicio` y `cursos.fecha_fin`;
- los campos de vigencia de `kits` si faltan;
- `configuracion_empresa.whatsapp_cursos`;
- `configuracion_empresa.whatsapp_servicios`;
- `configuracion_empresa.ubicacion_url`;
- `convenios`;
- `testimonios`;
- `tiktok_publicaciones`;
- políticas RLS para las nuevas tablas;
- bucket `testimonios` con máximo 50 MB;
- políticas de Storage para que solo administradores puedan subir/modificar/eliminar videos.

## Imágenes

Si todavía no está configurado el bucket de imágenes, ejecuta:

```text
migraciones/005_almacenamiento_imagenes.sql
```

Las imágenes principales de productos se relacionan mediante `imagenes_producto`. Cursos, servicios, promociones y convenios guardan una URL de imagen en su propia fila.

## Permisos

Si la web devuelve `permission denied for table ...`, revisa `002_permisos_api.sql` y las políticas RLS. La clave publicable de Supabase no debe ser la capa de seguridad: las restricciones deben estar en PostgreSQL/RLS.

Los visitantes pueden leer contenido activo. Las escrituras se permiten solo a usuarios autenticados que cumplan `public.es_administrador()`.

## Autenticación

1. Crea el usuario en Supabase Authentication.
2. Copia su UUID de `auth.users`.
3. Crea un registro activo en `public.administradores` con ese UUID como `auth_user_id`.
4. Inicia sesión desde `/acceso`.

Nunca uses `service_role` en el frontend.

## Tablas utilizadas

- `administradores`
- `categorias`
- `marcas`
- `productos`
- `imagenes_producto`
- `kits`
- `kit_productos`
- `servicios`
- `cursos`
- `configuracion_empresa`
- `convenios`
- `testimonios`
- `tiktok_publicaciones`

