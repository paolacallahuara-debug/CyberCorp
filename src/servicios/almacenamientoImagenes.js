import { clienteSupabase } from "../configuracion/clienteSupabase";

const BUCKET_IMAGENES = "imagenes-publicas";
const TAMANO_MAXIMO = 8 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionArchivo(archivo) {
  const porNombre = archivo.name?.split(".").pop()?.toLowerCase();
  if (porNombre && /^[a-z0-9]+$/.test(porNombre)) return porNombre === "jpeg" ? "jpg" : porNombre;
  if (archivo.type === "image/png") return "png";
  if (archivo.type === "image/webp") return "webp";
  return "jpg";
}

export async function subirImagenCatalogo(archivo, tipo) {
  if (!(archivo instanceof File) || archivo.size === 0) return null;
  if (!clienteSupabase) throw new Error("Supabase no está configurado para subir imágenes.");
  if (!TIPOS_PERMITIDOS.has(archivo.type)) {
    throw new Error("La imagen debe estar en formato JPG, PNG o WebP.");
  }
  if (archivo.size > TAMANO_MAXIMO) {
    throw new Error("La imagen no puede superar los 8 MB.");
  }

  const carpeta = {
    productos: "productos",
    cursos: "cursos",
    servicios: "servicios",
    ofertas: "promociones",
    convenios: "convenios",
  }[tipo] || "catalogo";
  const ruta = `${carpeta}/${crypto.randomUUID()}.${extensionArchivo(archivo)}`;

  const { error } = await clienteSupabase.storage
    .from(BUCKET_IMAGENES)
    .upload(ruta, archivo, {
      cacheControl: "31536000",
      contentType: archivo.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `No se pudo subir la imagen: ${error.message}. Verifica la migración 005_almacenamiento_imagenes.sql.`,
    );
  }

  const { data } = clienteSupabase.storage.from(BUCKET_IMAGENES).getPublicUrl(ruta);
  if (!data?.publicUrl) throw new Error("Supabase no devolvió la URL pública de la imagen.");
  return data.publicUrl;
}
