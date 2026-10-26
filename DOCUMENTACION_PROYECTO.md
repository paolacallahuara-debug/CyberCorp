# CyberCorp — documentación técnica del proyecto

Esta versión de CyberCorp trabaja **únicamente con Supabase**. Se eliminaron `apiLocal.js`, la carpeta `datos_falsos` y los servicios antiguos que dependían de información local.

## 1. Tecnologías

- React 19
- Vite 8
- React Router
- Supabase: PostgreSQL, Auth y Storage
- Radix UI para controles del panel
- Lucide React para iconos
- Sonner para notificaciones

Comandos:

```bash
npm install
npm run dev
npm run build
npm run lint
```

## 2. Variables de entorno

Copia `.env.example` como `.env.local`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

La clave publicable/anon puede estar en el frontend. **Nunca** debe utilizarse `service_role` dentro de React.

## 3. Estructura principal

```text
src/
├── componentes/
│   ├── interfaz/              Controles reutilizables
│   └── navegacion/            Enlaces y componentes de navegación
├── configuracion/
│   ├── baseDatos.js           Variables de conexión
│   ├── clienteSupabase.js     Cliente oficial de Supabase
│   └── tablasSupabase.js      Nombres de las tablas
├── contexto/
│   ├── AutenticacionContexto.jsx
│   ├── CarritoContexto.jsx
│   ├── DatosContexto.jsx      Datos globales + contactos WhatsApp
│   └── TemaContexto.jsx
├── estilos/
│   ├── globales.css
│   ├── neofuturista.css
│   ├── responsivo.css         Capa final responsive
│   └── controles.css
├── estructura/
│   ├── DisenoPrincipal.jsx
│   ├── DisenoAdministrador.jsx
│   ├── Encabezado.jsx
│   ├── EncabezadoAdministrador.jsx
│   ├── LogoEmpresa.jsx
│   └── PieDePagina.jsx
├── funcionalidades/
│   ├── cliente/
│   │   ├── componentes/
│   │   └── paginas/
│   │       ├── PaginaInicio.jsx
│   │       ├── PaginaProductos.jsx
│   │       ├── PaginaCursos.jsx
│   │       ├── PaginaServicios.jsx
│   │       ├── PaginaTestimonios.jsx
│   │       └── PaginaSobreNosotros.jsx
│   ├── carrito/
│   ├── administrador/
│   └── migracion/             Validación y exportación JSON
├── ganchos/
├── rutas/
├── servicios/
│   ├── adaptadoresSupabase.js
│   ├── clienteSupabase.js
│   ├── almacenamientoImagenes.js
│   └── almacenamientoVideos.js
└── utilidades/

base_de_datos/
├── tablas_referencia.txt
└── migraciones/
    ├── 002_permisos_api.sql
    ├── 003_diagnostico_catalogo.sql
    ├── 004_normalizar_imagenes_producto.sql
    ├── 005_almacenamiento_imagenes.sql
    └── 006_contenido_institucional_testimonios.sql
```

## 4. Flujo de la aplicación

```text
main.jsx
  ↓
Aplicacion.jsx
  ↓
BrowserRouter
  ↓
TemaProveedor
  ↓
AutenticacionProveedor
  ↓
CarritoProveedor
  ↓
DatosProveedor
  ↓
RutasAplicacion
```

Para los datos:

```text
Pantalla
  ↓
DatosContexto
  ↓
useServicioSupabase
  ↓
servicios/clienteSupabase.js
  ↓
Supabase
  ↓
adaptadoresSupabase.js
  ↓
Formato usado por React
```

Ya no existe un fallback de JSON/localStorage para el catálogo.

## 5. Rutas públicas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio, categorías, promociones, productos, servicios y beneficios/convenios |
| `/productos` | Catálogo con filtros y paginación |
| `/cursos` | Cursos técnicos y próximas fechas |
| `/servicios` | Servicios profesionales |
| `/testimonios` | Videos de testimonios y publicaciones de TikTok |
| `/nosotros` | Historia, áreas de trabajo y convenios institucionales |
| `/acceso` | Acceso administrativo |
| `/administrador` | Panel protegido |

## 6. Tablas principales de Supabase

El frontend utiliza:

- `administradores`
- `categorias`
- `marcas`
- `productos`
- `imagenes_producto`
- `kits` (promociones)
- `kit_productos`
- `servicios`
- `cursos`
- `configuracion_empresa`
- `convenios`
- `testimonios`
- `tiktok_publicaciones`

### Nuevas tablas

`convenios` contiene título, descripción, imagen, enlace y estado. Se utiliza tanto en Inicio como en Sobre nosotros. Desde el panel se pueden crear registros como **Cooperativa Madre y Maestra**, **Clínica La Familia** u otros acuerdos futuros sin cambiar código.

`testimonios` admite dos tipos de video:

- `archivo`: archivo cargado al bucket `testimonios`;
- `url`: enlace externo (YouTube, Facebook, Instagram, TikTok, etc.).

Los videos de YouTube se reproducen embebidos. Otros proveedores externos se presentan como un enlace seguro que abre la publicación original, evitando depender de scripts externos de redes sociales.

`tiktok_publicaciones` guarda enlaces independientes a publicaciones de TikTok y se muestra en la parte inferior de `/testimonios`.

## 7. Migración 006

Para habilitar las nuevas funciones en una base existente ejecuta en **Supabase → SQL Editor**:

```text
base_de_datos/migraciones/006_contenido_institucional_testimonios.sql
```

La migración:

1. agrega `fecha_inicio` y `fecha_fin` a `cursos`;
2. verifica `fecha_inicio` y `fecha_fin` en `kits`;
3. agrega `whatsapp_cursos`, `whatsapp_servicios` y `ubicacion_url` a `configuracion_empresa`;
4. crea `convenios`;
5. crea `testimonios`;
6. crea `tiktok_publicaciones`;
7. activa RLS y crea políticas de lectura pública / escritura administrativa;
8. crea el bucket público `testimonios` con límite de **50 MB**;
9. restringe subir, modificar y borrar videos a administradores.

Si las tablas ya existen, la migración utiliza `IF NOT EXISTS` en las partes estructurales y reemplaza únicamente las políticas propias de esta ampliación.

## 8. Autenticación y permisos

Supabase Auth maneja correo y contraseña. Después del login, el frontend comprueba que `auth.uid()` exista en `administradores.auth_user_id` y que el administrador esté activo.

```text
Supabase Auth
  ↓
auth.uid()
  ↓
administradores.auth_user_id
  ↓
activo = true
  ↓
Panel administrativo
```

RLS es la protección real de la base. Los visitantes pueden leer contenido activo, pero no pueden insertar, editar ni eliminar registros. Los administradores autenticados sí pueden realizar CRUD mediante `public.es_administrador()`.

## 9. Productos

La página pública mantiene:

- búsqueda por nombre, código, marca y descripción;
- filtro por categorías;
- Mostrar más / Mostrar menos en pantallas pequeñas;
- 20 productos por página;
- paginación numérica;
- layout responsive.

El panel administrativo incorpora ahora un filtro equivalente:

- buscador;
- categorías;
- Mostrar más / Mostrar menos en móvil/tableta;
- 20 registros por página;
- editar, eliminar, ocultar/mostrar y agregar sin cargar una tabla visual gigantesca.

Las imágenes de producto se guardan normalizadas en `imagenes_producto`. El frontend no necesita una columna `productos.imagen_url`.

## 10. Cursos

`cursos` admite ahora:

```text
fecha_inicio TIMESTAMPTZ
fecha_fin    TIMESTAMPTZ
```

El administrador puede definir ambas fechas. Cuando hay una fecha de inicio, la tarjeta pública la muestra. Las consultas de cursos se envían al **WhatsApp de cursos**.

Las imágenes continúan diseñadas para formato vertical 4:5.

## 11. Promociones

En el proyecto `kits = promociones`.

`fecha_inicio` y `fecha_fin` determinan si una promoción está vigente. Inicio solo muestra promociones activas dentro de su periodo cuando las fechas están definidas.

## 12. Convenios y beneficios

Los convenios se administran desde la pestaña **Convenios**.

Campos:

- título;
- descripción;
- URL de imagen o subida JPG/PNG/WebP;
- enlace externo opcional;
- activo/inactivo.

Inicio muestra hasta tres convenios activos recientes en la sección de beneficios. Sobre nosotros muestra todos los convenios activos. Esto permite publicar beneficios como carnets para clientes o descuentos de instituciones sin modificar React.

Ejemplo para el panel: título `Clínica La Familia · Beneficio para clientes CyberCorp` y una descripción como `Acceso a carnet de beneficiario con descuentos de 10%, 20% y 30% según el servicio comprendido por el convenio.`. La imagen y el enlace pueden completarse cuando CyberCorp disponga del material oficial.

## 13. Testimonios

Desde la pestaña **Testimonios** el administrador puede:

- escribir título;
- indicar nombre del cliente;
- añadir descripción;
- elegir `Enlace externo` o `Video subido`;
- cargar videos de hasta 50 MB;
- activar/desactivar;
- editar y eliminar registros.

Storage utilizado:

```text
bucket: testimonios
máximo: 50 MB
formatos: MP4, WebM, MOV, M4V
```

## 14. TikTok

La pestaña **TikTok** del panel administra `tiktok_publicaciones`.

Se guarda un título opcional y la URL de la publicación. En la página de testimonios se muestran como accesos directos a TikTok.

## 15. Contactos y WhatsApp

`configuracion_empresa` tiene tres contactos de WhatsApp:

- `whatsapp`: contacto general/productos;
- `whatsapp_cursos`: información e inscripción de cursos;
- `whatsapp_servicios`: instalaciones, soporte y servicios.

`DatosContexto.jsx` recibe un segundo argumento en `consultar()`:

```js
consultar("Mensaje", "general")
consultar("Mensaje", "cursos")
consultar("Mensaje", "servicios")
```

Cada sección abre el número correspondiente.

## 16. Footer

El footer toma la información de `configuracion_empresa` y puede mostrar:

- dirección;
- enlace de ubicación;
- horarios de atención;
- teléfono;
- correo;
- Facebook;
- Instagram;
- TikTok;
- WhatsApp general/productos;
- WhatsApp de cursos;
- WhatsApp de servicios.

Todo puede modificarse desde **Administrador → Configuración**.

## 17. Tema y logos

- modo oscuro → `/public/marca/logo-sinfondo.png`
- modo claro → `/public/marca/logo-claro.png`

El tema se mantiene en el navegador y cambia el logo automáticamente.

## 18. Responsive

La capa final se encuentra en `src/estilos/responsivo.css`.

Está preparada para:

- monitores grandes;
- laptops;
- tablets;
- celulares;
- pantallas pequeñas de aproximadamente 320–380 px.

Las tablas del administrador se convierten en tarjetas en móvil y los filtros/categorías reducen su contenido inicial para evitar desbordes.

## 19. Imágenes y videos

Imágenes de catálogos:

```text
bucket: imagenes-publicas
máximo: 8 MB
JPG / PNG / WebP
```

Videos de testimonios:

```text
bucket: testimonios
máximo: 50 MB
MP4 / WebM / MOV / M4V
```

Los archivos se suben directamente desde el panel administrativo con la sesión del administrador. Las políticas de Storage impiden que un visitante anónimo suba o elimine archivos.

## 20. Archivos clave para futuras modificaciones

| Necesidad | Archivo |
| --- | --- |
| Nueva ruta | `src/rutas/RutasAplicacion.jsx` |
| Menú principal | `src/estructura/Encabezado.jsx` |
| Footer | `src/estructura/PieDePagina.jsx` |
| Inicio | `src/funcionalidades/cliente/paginas/PaginaInicio.jsx` |
| Productos | `PaginaProductos.jsx` |
| Cursos | `PaginaCursos.jsx` |
| Testimonios | `PaginaTestimonios.jsx` |
| Sobre nosotros / convenios | `PaginaSobreNosotros.jsx` |
| Panel administrativo | `PaginaDashboardAdmin.jsx` |
| Formularios del panel | `FormularioEntidad.jsx` |
| Lectura/CRUD Supabase | `src/servicios/clienteSupabase.js` |
| Conversión de columnas | `src/servicios/adaptadoresSupabase.js` |
| Storage imágenes | `almacenamientoImagenes.js` |
| Storage videos | `almacenamientoVideos.js` |
| Responsive | `src/estilos/responsivo.css` |
| SQL nueva funcionalidad | `006_contenido_institucional_testimonios.sql` |

## 21. Orden recomendado al instalar esta versión

1. Conserva tu `.env.local` con las credenciales públicas de Supabase.
2. Ejecuta `006_contenido_institucional_testimonios.sql` en Supabase.
3. Confirma que el bucket `imagenes-publicas` ya existe; si no, ejecuta también la migración 005.
4. Ejecuta `npm install`.
5. Ejecuta `npm run dev`.
6. Inicia sesión en `/acceso`.
7. Configura los tres WhatsApp, dirección, ubicación, horarios y redes.
8. Crea convenios, testimonios y publicaciones de TikTok desde el panel.
9. Comprueba la web en escritorio y con el modo dispositivo de Chrome DevTools.

