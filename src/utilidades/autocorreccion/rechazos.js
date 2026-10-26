/**
 * Persistencia de correcciones rechazadas por el usuario.
 * Clave en localStorage: "autocorreccion:rechazos"
 * Valor: JSON con un objeto { [clave]: true }
 *
 * Tipos de clave:
 *   "ort:clausula"       → corrección ortográfica/tilde de la palabra "clausula"
 *   "prop:porfavor"      → corrección de lista propia
 *   "mayus:hola"         → mayúscula inicial de la palabra "hola"
 *   "tipo:doble-espacio" → regla tipográfica con ese id
 */

const STORAGE_KEY = "autocorreccion:rechazos";

/** Lee el conjunto de rechazos del localStorage. */
function leerRechazos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Guarda el conjunto de rechazos en localStorage. */
function guardarRechazos(rechazos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rechazos));
  } catch {
    // localStorage puede estar lleno o bloqueado; ignora silenciosamente.
  }
}

/**
 * Devuelve true si la clave dada fue rechazada por el usuario.
 * @param {string} clave
 */
export function estaRechazado(clave) {
  const rechazos = leerRechazos();
  return Boolean(rechazos[clave]);
}

/**
 * Marca una clave como rechazada permanentemente.
 * @param {string} clave
 */
export function marcarRechazado(clave) {
  const rechazos = leerRechazos();
  rechazos[clave] = true;
  guardarRechazos(rechazos);
}

/**
 * Borra todos los rechazos almacenados.
 * (Para el botón "Restablecer autocorrección" del panel de configuración.)
 */
export function restablecerRechazos() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada
  }
}

/**
 * Devuelve el número de rechazos almacenados.
 */
export function contarRechazos() {
  return Object.keys(leerRechazos()).length;
}
