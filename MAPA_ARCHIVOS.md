# Mapa de archivos de CyberCorp

## Raíz
- `.env.example`: variables públicas requeridas.
- `DOCUMENTACION_PROYECTO.md`: documentación técnica completa.
- `LEEME.md`: inicio rápido.
- `vite.config.js`: configuración de Vite.

## Base de datos
- `base_de_datos/tablas_referencia.txt`: esquema de referencia.
- `base_de_datos/migraciones/005_almacenamiento_imagenes.sql`: bucket de imágenes.
- `base_de_datos/migraciones/006_contenido_institucional_testimonios.sql`: convenios, testimonios, TikTok, fechas, contactos y bucket de videos.

## Configuración y datos
- `src/configuracion/clienteSupabase.js`: crea el cliente Supabase.
- `src/configuracion/tablasSupabase.js`: nombres de tablas.
- `src/servicios/clienteSupabase.js`: lecturas y CRUD.
- `src/servicios/adaptadoresSupabase.js`: transforma columnas SQL a la interfaz.
- `src/servicios/almacenamientoImagenes.js`: subida de imágenes.
- `src/servicios/almacenamientoVideos.js`: subida de testimonios hasta 50 MB.

## Interfaz pública
- `src/funcionalidades/cliente/paginas/PaginaInicio.jsx`
- `src/funcionalidades/cliente/paginas/PaginaProductos.jsx`
- `src/funcionalidades/cliente/paginas/PaginaCursos.jsx`
- `src/funcionalidades/cliente/paginas/PaginaServicios.jsx`
- `src/funcionalidades/cliente/paginas/PaginaTestimonios.jsx`
- `src/funcionalidades/cliente/paginas/PaginaSobreNosotros.jsx`
- `src/estructura/PieDePagina.jsx`

## Administración
- `src/funcionalidades/administrador/paginas/PaginaDashboardAdmin.jsx`: tabs, filtros, tablas y CRUD.
- `src/funcionalidades/administrador/componentes/FormularioEntidad.jsx`: formularios por tipo de contenido.
- `src/funcionalidades/administrador/componentes/GestionCatalogos.jsx`: categorías y marcas.

## Responsive
- `src/estilos/responsivo.css`: ajustes finales para monitor, laptop, tablet y celular.

## Eliminado
Esta versión ya no contiene `src/datos_falsos`, `src/servicios/apiLocal.js` ni los servicios locales antiguos. La única fuente de datos es Supabase.
