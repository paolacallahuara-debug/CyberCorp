/**
 * Cliente para la API pública de LanguageTool.
 * Endpoint: https://api.languagetool.org/v2/check
 * Sin clave de API (límite ~20 peticiones/minuto).
 *
 * Solo se llama manualmente desde el botón "Revisar texto" en los textarea.
 * Límite de texto: 1 000 caracteres por petición.
 */

const ENDPOINT = "https://api.languagetool.org/v2/check";
const MAX_CHARS = 1000;

/**
 * @typedef {Object} Coincidencia
 * @property {string} mensaje     Descripción del error.
 * @property {string} descripcion Descripción larga.
 * @property {number} offset      Posición en el texto.
 * @property {number} largo       Longitud del fragmento erróneo.
 * @property {string[]} sugerencias  Hasta 5 sugerencias de reemplazo.
 * @property {string} ruleId     ID de la regla (para informar al usuario).
 */

/**
 * Revisa el texto con LanguageTool.
 * @param {string} texto
 * @returns {Promise<Coincidencia[]>}
 */
export async function revisarConLanguageTool(texto) {
  const textoLimitado = texto.slice(0, MAX_CHARS);

  const cuerpo = new URLSearchParams({
    text: textoLimitado,
    language: "es",
    enabledOnly: "false",
  });

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo.toString(),
  });

  if (res.status === 429) {
    throw new Error("Límite de peticiones alcanzado. Espera un momento e intenta de nuevo.");
  }

  if (!res.ok) {
    throw new Error(`Error del servicio de revisión (${res.status}). Intenta más tarde.`);
  }

  const datos = await res.json();

  return (datos.matches ?? []).map((match) => ({
    mensaje: match.message,
    descripcion: match.shortMessage || match.message,
    offset: match.offset,
    largo: match.length,
    sugerencias: (match.replacements ?? []).slice(0, 5).map((r) => r.value),
    ruleId: match.rule?.id ?? "",
  }));
}
