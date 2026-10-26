import { clienteSupabase } from "../configuracion/clienteSupabase";

const BUCKET_TESTIMONIOS = "testimonios";
const TAMANO_MAXIMO = 50 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

function extensionArchivo(archivo) {
  const porNombre = archivo.name?.split(".").pop()?.toLowerCase();
  if (porNombre && /^[a-z0-9]+$/.test(porNombre)) return porNombre;
  if (archivo.type === "video/webm") return "webm";
  if (archivo.type === "video/quicktime") return "mov";
  return "mp4";
}

export async function subirVideoTestimonio(archivo) {
  if (!(archivo instanceof File) || archivo.size === 0) return null;
  if (!clienteSupabase) throw new Error("Supabase no está configurado para subir videos.");
  if (!TIPOS_PERMITIDOS.has(archivo.type)) {
    throw new Error("El video debe estar en formato MP4, WebM, MOV o M4V.");
  }
  if (archivo.size > TAMANO_MAXIMO) {
    throw new Error("El video no puede superar los 50 MB.");
  }

  const ruta = `clientes/${crypto.randomUUID()}.${extensionArchivo(archivo)}`;
  const { error } = await clienteSupabase.storage
    .from(BUCKET_TESTIMONIOS)
    .upload(ruta, archivo, {
      cacheControl: "31536000",
      contentType: archivo.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `No se pudo subir el video: ${error.message}. Verifica la migración 006_contenido_institucional_testimonios.sql.`,
    );
  }

  const { data } = clienteSupabase.storage.from(BUCKET_TESTIMONIOS).getPublicUrl(ruta);
  if (!data?.publicUrl) throw new Error("Supabase no devolvió la URL pública del video.");
  return data.publicUrl;
}
