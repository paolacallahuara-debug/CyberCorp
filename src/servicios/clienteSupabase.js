import { clienteSupabase as cliente } from "../configuracion/clienteSupabase";
import { tablas } from "../configuracion/tablasSupabase";
import { desdeSupabase, paraSupabase } from "./adaptadoresSupabase";

export const esSupabase = true;

function conexion() {
  if (!cliente) {
    throw new Error(
      "Completa VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en .env.local y reinicia Vite.",
    );
  }
  return cliente;
}

function verificar({ error, data }, accion) {
  if (error) {
    if (/permission denied for table/i.test(error.message)) {
      throw new Error(
        `La base de datos rechazó ${accion.toLowerCase()}: ${error.message}. Revisa las políticas RLS y las migraciones de base_de_datos/migraciones.`,
      );
    }
    throw new Error(`${accion}: ${error.message}`);
  }
  return data;
}

export async function verificarAdministrador() {
  const c = conexion();
  const {
    data: { user },
    error,
  } = await c.auth.getUser();
  if (error || !user) return false;

  const r = await c
    .from(tablas.administradores)
    .select("id,activo")
    .eq("auth_user_id", user.id)
    .eq("activo", true)
    .maybeSingle();
  verificar(r, "Verificar administrador");
  return Boolean(r.data);
}

export async function iniciarSesion(email, password) {
  const c = conexion();
  verificar(await c.auth.signInWithPassword({ email, password }), "Iniciar sesión");
  if (!(await verificarAdministrador())) {
    await c.auth.signOut();
    throw new Error(
      "La cuenta no tiene un perfil activo en administradores. Revisa auth_user_id en Supabase.",
    );
  }
}

export async function cerrarSesion() {
  if (cliente) verificar(await cliente.auth.signOut(), "Cerrar sesión");
}

async function paginar(tabla) {
  const filas = [];
  for (let desde = 0; ; desde += 1000) {
    const bloque = verificar(
      await conexion().from(tabla).select("*").order("id").range(desde, desde + 999),
      `Leer ${tabla}`,
    );
    filas.push(...bloque);
    if (bloque.length < 1000) return filas;
  }
}

async function leerConfiguracion() {
  return verificar(
    await conexion()
      .from(tablas.configuracion)
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1),
    "Leer configuración",
  );
}

async function leerSupabase() {
  // Producto primero: si faltan permisos muestra un error claro antes de hacer el resto de consultas.
  const productos = await paginar(tablas.productos);
  const claves = [
    "cursos",
    "ofertas",
    "servicios",
    "categorias",
    "marcas",
    "imagenes",
    "kitProductos",
    "convenios",
    "testimonios",
    "tiktokPublicaciones",
  ];

  const [resultados, configuracion] = await Promise.all([
    Promise.all(claves.map((k) => paginar(tablas[k]))),
    leerConfiguracion(),
  ]);

  return desdeSupabase({
    productos,
    ...Object.fromEntries(claves.map((k, i) => [k, resultados[i]])),
    configuracion,
  });
}

async function actualizarImagenProducto(productoId, imagen) {
  if (imagen === undefined) return;
  const c = conexion();
  const existentes = verificar(
    await c
      .from(tablas.imagenes)
      .select("id,url")
      .eq("producto_id", productoId)
      .eq("es_principal", true)
      .limit(1),
    "Leer imagen",
  );

  if (!imagen) {
    if (existentes[0]) {
      verificar(
        await c.from(tablas.imagenes).delete().eq("id", existentes[0].id),
        "Quitar imagen",
      );
    }
  } else if (existentes[0]) {
    if (existentes[0].url !== imagen) {
      verificar(
        await c.from(tablas.imagenes).update({ url: imagen }).eq("id", existentes[0].id),
        "Actualizar imagen",
      );
    }
  } else {
    verificar(
      await c
        .from(tablas.imagenes)
        .insert({ producto_id: productoId, url: imagen, es_principal: true }),
      "Agregar imagen",
    );
  }
}

async function actualizarProductosKit(kitId, seleccion) {
  if (!Array.isArray(seleccion)) return;
  const c = conexion();
  const actuales = verificar(
    await c
      .from(tablas.kitProductos)
      .select("id,producto_id,cantidad")
      .eq("kit_id", kitId),
    "Leer productos del kit",
  );

  const deseados = new Map(
    seleccion.map((x) => [x.producto_id, Number(x.cantidad)]),
  );

  for (const actual of actuales) {
    if (!deseados.has(actual.producto_id)) {
      verificar(
        await c.from(tablas.kitProductos).delete().eq("id", actual.id),
        "Quitar producto del kit",
      );
    } else if (actual.cantidad !== deseados.get(actual.producto_id)) {
      verificar(
        await c
          .from(tablas.kitProductos)
          .update({ cantidad: deseados.get(actual.producto_id) })
          .eq("id", actual.id),
        "Actualizar cantidad del kit",
      );
    }
  }

  const ids = new Set(actuales.map((x) => x.producto_id));
  const nuevos = seleccion
    .filter((x) => !ids.has(x.producto_id))
    .map((x) => ({ kit_id: kitId, ...x }));
  if (nuevos.length) {
    verificar(
      await c.from(tablas.kitProductos).insert(nuevos),
      "Agregar productos al kit",
    );
  }
}

async function guardarEntidadSupabase(tipo, entrada, anterior) {
  const permitidos = [
    "productos",
    "cursos",
    "servicios",
    "ofertas",
    "convenios",
    "testimonios",
    "tiktokPublicaciones",
  ];
  if (!permitidos.includes(tipo)) throw new Error("Módulo desconocido.");

  const tabla = tablas[tipo];
  const payload = paraSupabase(tipo, entrada, anterior);
  const consulta = anterior?.id
    ? conexion().from(tabla).update(payload).eq("id", anterior.id).select("id").single()
    : conexion().from(tabla).insert(payload).select("id").single();

  const fila = verificar(await consulta, `Guardar ${tipo}`);
  if (tipo === "productos") {
    await actualizarImagenProducto(fila.id, entrada.imagen_url || entrada.imagen);
  }
  if (tipo === "ofertas") {
    await actualizarProductosKit(fila.id, entrada.productosKit);
  }
  return leerSupabase();
}

async function eliminarEntidadSupabase(tipo, id) {
  const permitidos = [
    "productos",
    "cursos",
    "servicios",
    "ofertas",
    "convenios",
    "testimonios",
    "tiktokPublicaciones",
  ];
  if (!permitidos.includes(tipo)) throw new Error("Módulo desconocido.");

  const filas = verificar(
    await conexion().from(tablas[tipo]).delete().eq("id", id).select("id"),
    `Eliminar ${tipo}`,
  );
  if (!filas.length) {
    throw new Error("No se eliminó el registro. Comprueba la sesión y los permisos.");
  }
  return leerSupabase();
}

async function guardarCatalogoSupabase(tipo, entrada, anterior) {
  if (!["categorias", "marcas"].includes(tipo)) {
    throw new Error("Catálogo desconocido.");
  }

  const payload = {
    nombre: entrada.nombre.trim(),
    slug:
      anterior?.slug ||
      `${entrada.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 8)}`,
    activo: Boolean(entrada.activo),
  };

  if (tipo === "categorias") {
    Object.assign(payload, {
      descripcion: entrada.descripcion || null,
      orden: Number(entrada.orden || 0),
    });
  }

  verificar(
    await (anterior?.id
      ? conexion().from(tablas[tipo]).update(payload).eq("id", anterior.id).select("id").single()
      : conexion().from(tablas[tipo]).insert(payload).select("id").single()),
    `Guardar ${tipo}`,
  );
  return leerSupabase();
}

async function eliminarCatalogoSupabase(tipo, id) {
  if (!["categorias", "marcas"].includes(tipo)) {
    throw new Error("Catálogo desconocido.");
  }
  const filas = verificar(
    await conexion().from(tablas[tipo]).delete().eq("id", id).select("id"),
    `Eliminar ${tipo}`,
  );
  if (!filas.length) throw new Error("No se pudo eliminar. Revisa los permisos.");
  return leerSupabase();
}

async function guardarConfiguracionSupabase(datos, cambios) {
  const payload = {
    whatsapp: cambios.whatsapp,
    whatsapp_cursos: cambios.whatsappCursos || cambios.whatsapp || null,
    whatsapp_servicios: cambios.whatsappServicios || cambios.whatsapp || null,
    telefono: cambios.telefono || null,
    email: cambios.email || null,
    direccion: cambios.direccion || null,
    ubicacion_url: cambios.ubicacionUrl || null,
    eslogan: cambios.eslogan || null,
    horarios: cambios.horarios || null,
    facebook_url: cambios.facebook || null,
    instagram_url: cambios.instagram || null,
    tiktok_url: cambios.tiktok || null,
    logo_url: cambios.logo || null,
  };

  const id = datos.configuracion.id;
  verificar(
    await (id
      ? conexion().from(tablas.configuracion).update(payload).eq("id", id).select("id").single()
      : conexion()
          .from(tablas.configuracion)
          .insert({ nombre_empresa: "CyberCorp", ...payload })
          .select("id")
          .single()),
    "Guardar configuración",
  );
  return leerSupabase();
}

export const servicioDatos = {
  leer: leerSupabase,
  guardarEntidad: guardarEntidadSupabase,
  eliminarEntidad: eliminarEntidadSupabase,
  guardarCatalogo: guardarCatalogoSupabase,
  eliminarCatalogo: eliminarCatalogoSupabase,
  guardarConfiguracion: guardarConfiguracionSupabase,
};
