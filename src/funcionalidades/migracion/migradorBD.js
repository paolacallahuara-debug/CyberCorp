export function validarDatos(d) {
  const colecciones = [
    "productos",
    "cursos",
    "ofertas",
    "servicios",
    "convenios",
    "testimonios",
    "tiktokPublicaciones",
  ];

  if (!d || !colecciones.every((k) => Array.isArray(d[k]) && d[k].length <= 10000)) {
    throw new Error("Catálogo inválido.");
  }

  for (const producto of d.productos) {
    if (
      !producto.id ||
      typeof producto.nombre !== "string" ||
      !producto.nombre.trim() ||
      !Number.isFinite(producto.precio) ||
      producto.precio < 0 ||
      !Number.isFinite(producto.stock) ||
      producto.stock < 0 ||
      typeof producto.activo !== "boolean"
    ) {
      throw new Error("Producto inválido.");
    }
  }

  for (const curso of d.cursos) {
    if (!curso.id || typeof curso.nombre !== "string" || typeof curso.activo !== "boolean") {
      throw new Error("Curso inválido.");
    }
  }

  for (const servicio of d.servicios) {
    if (!servicio.id || typeof servicio.nombre !== "string" || typeof servicio.activo !== "boolean") {
      throw new Error("Servicio inválido.");
    }
  }

  for (const oferta of d.ofertas) {
    if (!oferta.id || typeof oferta.nombre !== "string" || typeof oferta.activo !== "boolean") {
      throw new Error("Promoción inválida.");
    }
  }

  if (
    !d.configuracion ||
    typeof d.configuracion.whatsapp !== "string" ||
    (d.configuracion.whatsapp && !/^[1-9]\d{7,14}$/.test(d.configuracion.whatsapp))
  ) {
    throw new Error("Configuración inválida.");
  }

  return d;
}

export function exportarDatos(datos) {
  const blob = new Blob(
    [
      JSON.stringify(
        { version: 2, exportado: new Date().toISOString(), datos },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cybercorp-exportacion.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
