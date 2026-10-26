// Convierte las columnas reales de Supabase a las propiedades que consume la interfaz.
const numero = (valor) => (valor == null ? null : Number(valor));
const texto = (valor) => valor || "";
const fechaIso = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : fecha.toISOString();
};

export const slug = (valor) =>
  valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "nuevo";

export const iconoCategoria = (nombre = "") =>
  /c[aá]mara|video/i.test(nombre)
    ? "Camera"
    : /gps|veh[ií]culo/i.test(nombre)
      ? "MapPin"
      : /alexa|asistente/i.test(nombre)
        ? "Speaker"
        : /alarma|seguridad/i.test(nombre)
          ? "ShieldCheck"
          : "Package";

export const iconoServicio = (nombre = "") =>
  /gps|veh[ií]culo/i.test(nombre)
    ? "MapPin"
    : /c[aá]mara|video/i.test(nombre)
      ? "Cctv"
      : /cerca|el[eé]ctrica/i.test(nombre)
        ? "Zap"
        : /alarma|sensor/i.test(nombre)
          ? "ShieldCheck"
          : "Wrench";

export function desdeSupabase({
  productos = [],
  cursos = [],
  ofertas = [],
  servicios = [],
  categorias = [],
  marcas = [],
  imagenes = [],
  kitProductos = [],
  configuracion = [],
  convenios = [],
  testimonios = [],
  tiktokPublicaciones = [],
}) {
  const categoriasPorId = new Map(categorias.map((x) => [x.id, x]));
  const marcasPorId = new Map(marcas.map((x) => [x.id, x]));
  const imagenPorProducto = new Map();

  [...imagenes]
    .sort(
      (a, b) =>
        Number(b.es_principal) - Number(a.es_principal) ||
        Number(a.orden || 0) - Number(b.orden || 0),
    )
    .forEach((x) => {
      if (!imagenPorProducto.has(x.producto_id)) imagenPorProducto.set(x.producto_id, x.url);
    });

  const configuracionFila = configuracion[0] || {};

  return {
    productos: productos.map((x) => {
      const categoria = categoriasPorId.get(x.categoria_id)?.nombre || "Sin categoría";
      const foto = imagenPorProducto.get(x.id) || "";
      return {
        ...x,
        precio: Number(x.precio),
        stock: Number(x.stock),
        categoria,
        marca: marcasPorId.get(x.marca_id)?.nombre || "",
        descripcion: texto(x.descripcion_corta || x.descripcion),
        imagen: foto,
        imagen_url: foto,
        icono: iconoCategoria(categoria),
      };
    }),
    cursos: cursos.map((x) => ({
      ...x,
      precio: numero(x.precio),
      descripcion: texto(x.descripcion_corta || x.descripcion),
      imagen: texto(x.imagen_url),
      temario: "",
      cupos: null,
      capacidad: null,
    })),
    ofertas: ofertas.map((x) => ({
      ...x,
      precio: Number(x.precio),
      anterior: numero(x.precio_anterior),
      descuento:
        x.precio_anterior > x.precio
          ? Math.round((1 - x.precio / x.precio_anterior) * 100)
          : 0,
      descripcion: texto(x.descripcion_corta || x.descripcion),
      imagen: texto(x.imagen_url),
      productosKit: kitProductos.filter((p) => p.kit_id === x.id),
    })),
    servicios: servicios.map((x) => ({
      ...x,
      precioDesde: numero(x.precio_desde),
      descripcion: texto(x.descripcion_corta || x.descripcion),
      imagen: texto(x.imagen_url),
      icono: iconoServicio(x.nombre),
    })),
    categorias,
    marcas,
    convenios: convenios.map((x) => ({
      ...x,
      titulo: texto(x.titulo),
      descripcion: texto(x.descripcion),
      imagen: texto(x.imagen_url),
      enlace: texto(x.enlace_url),
    })),
    testimonios: testimonios.map((x) => ({
      ...x,
      titulo: texto(x.titulo),
      nombreCliente: texto(x.nombre_cliente),
      descripcion: texto(x.descripcion),
      tipoVideo: texto(x.tipo_video || "url"),
      videoUrl: texto(x.video_url),
      videoExternoUrl: texto(x.video_externo_url),
    })),
    tiktokPublicaciones: tiktokPublicaciones.map((x) => ({
      ...x,
      titulo: texto(x.titulo),
      tiktokUrl: texto(x.tiktok_url),
    })),
    configuracion: {
      id: configuracionFila.id || null,
      nombre: configuracionFila.nombre_empresa || "CyberCorp",
      whatsapp: (() => {
        const num = String(configuracionFila.whatsapp || "59167370323").replace(/\D/g, "");
        return num.includes("75123977") || !num ? "59167370323" : num;
      })(),
      whatsappCursos: (() => {
        const num = String(configuracionFila.whatsapp_cursos || "59163777341").replace(/\D/g, "");
        return num.includes("75123977") || !num ? "59163777341" : num;
      })(),
      whatsappServicios: (() => {
        const num = String(configuracionFila.whatsapp_servicios || "59167370323").replace(/\D/g, "");
        return num.includes("75149155") || num.includes("75123977") || !num ? "59167370323" : num;
      })(),
      telefono: texto(configuracionFila.telefono),
      email: texto(configuracionFila.email),
      direccion: texto(configuracionFila.direccion),
      ubicacionUrl: texto(configuracionFila.ubicacion_url),
      eslogan: texto(configuracionFila.eslogan),
      facebook: texto(configuracionFila.facebook_url),
      instagram: texto(configuracionFila.instagram_url),
      tiktok: texto(configuracionFila.tiktok_url),
      logo: texto(configuracionFila.logo_url),
      horarios: texto(configuracionFila.horarios),
      tipoCambio: 6.96,
    },
  };
}

export function paraSupabase(tipo, entrada, anterior = null) {
  const slugUnico = anterior?.slug || `${slug(entrada.nombre || entrada.titulo || "registro")}-${crypto.randomUUID().slice(0, 8)}`;

  if (tipo === "productos") {
    return {
      nombre: entrada.nombre.trim(),
      activo: Boolean(entrada.activo),
      slug: slugUnico,
      codigo:
        entrada.codigo?.trim() ||
        anterior?.codigo ||
        `CC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      descripcion_corta: entrada.descripcion?.trim() || null,
      descripcion: entrada.descripcion?.trim() || null,
      categoria_id: entrada.categoria_id || null,
      marca_id: entrada.marca_id || null,
      precio: Number(entrada.precio),
      stock: Math.max(0, Math.trunc(Number(entrada.stock))),
      destacado: Boolean(entrada.destacado),
      nuevo: Boolean(entrada.nuevo),
    };
  }

  if (tipo === "cursos") {
    return {
      nombre: entrada.nombre.trim(),
      activo: Boolean(entrada.activo),
      slug: slugUnico,
      descripcion_corta: entrada.descripcion?.trim() || null,
      precio: entrada.precio === "" || entrada.precio == null ? null : Number(entrada.precio),
      duracion: entrada.duracion?.trim() || null,
      modalidad: entrada.modalidad?.trim() || null,
      imagen_url: entrada.imagen_url?.trim() || null,
      destacado: Boolean(entrada.destacado),
      orden: Number(entrada.orden || 0),
      fecha_inicio: fechaIso(entrada.fecha_inicio),
      fecha_fin: fechaIso(entrada.fecha_fin),
    };
  }

  if (tipo === "servicios") {
    return {
      nombre: entrada.nombre.trim(),
      activo: Boolean(entrada.activo),
      slug: slugUnico,
      descripcion_corta: entrada.descripcion?.trim() || null,
      precio_desde:
        entrada.precio_desde === "" || entrada.precio_desde == null
          ? null
          : Number(entrada.precio_desde),
      imagen_url: entrada.imagen_url?.trim() || null,
      destacado: Boolean(entrada.destacado),
      orden: Number(entrada.orden || 0),
    };
  }

  if (tipo === "ofertas") {
    return {
      nombre: entrada.nombre.trim(),
      activo: Boolean(entrada.activo),
      slug: slugUnico,
      codigo:
        entrada.codigo?.trim() ||
        anterior?.codigo ||
        `KIT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      descripcion_corta: entrada.descripcion?.trim() || null,
      precio: Number(entrada.precio),
      precio_anterior:
        entrada.precio_anterior === "" || entrada.precio_anterior == null
          ? null
          : Number(entrada.precio_anterior),
      imagen_url: entrada.imagen_url?.trim() || null,
      destacado: Boolean(entrada.destacado),
      fecha_inicio: fechaIso(entrada.fecha_inicio),
      fecha_fin: fechaIso(entrada.fecha_fin),
    };
  }

  if (tipo === "convenios") {
    return {
      titulo: entrada.titulo.trim(),
      descripcion: entrada.descripcion?.trim() || null,
      imagen_url: entrada.imagen_url?.trim() || null,
      enlace_url: entrada.enlace_url?.trim() || null,
      activo: Boolean(entrada.activo),
    };
  }

  if (tipo === "testimonios") {
    const tipoVideo = entrada.tipo_video === "archivo" ? "archivo" : "url";
    return {
      titulo: entrada.titulo.trim(),
      nombre_cliente: entrada.nombre_cliente?.trim() || null,
      descripcion: entrada.descripcion?.trim() || null,
      tipo_video: tipoVideo,
      video_url: tipoVideo === "archivo" ? entrada.video_url?.trim() || anterior?.video_url || null : null,
      video_externo_url: tipoVideo === "url" ? entrada.video_externo_url?.trim() || null : null,
      activo: Boolean(entrada.activo),
    };
  }

  if (tipo === "tiktokPublicaciones") {
    return {
      titulo: entrada.titulo?.trim() || null,
      tiktok_url: entrada.tiktok_url.trim(),
      activo: Boolean(entrada.activo),
    };
  }

  throw new Error("Tipo de registro desconocido.");
}
