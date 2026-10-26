/**
 * Reglas tipográficas que se aplican al escribir delimitadores.
 * Cada regla tiene:
 *   - id:      clave única para el sistema de rechazos ("tipo:<id>")
 *   - aplicar: función (texto, posicion) → { texto, offset } | null
 *              Recibe el texto completo del campo y la posición del cursor.
 *              Devuelve el texto corregido y el ajuste de cursor, o null si no aplica.
 *   - descripcion: texto para depuración.
 */

/** Doble espacio → espacio simple */
const doblesEspacio = {
  id: "doble-espacio",
  descripcion: "Doble espacio → uno solo",
  aplicar(texto, pos) {
    // Busca el doble espacio justo antes del cursor
    if (pos < 2) return null;
    const sub = texto.slice(0, pos);
    const idx = sub.lastIndexOf("  ");
    if (idx === -1) return null;
    const nuevo = texto.slice(0, idx) + " " + texto.slice(idx + 2);
    return { texto: nuevo, offset: -1 };
  },
};

/** Espacio antes de coma/punto/punto y coma/dos puntos/exclamación/interrogación */
const espacioAntesSigno = {
  id: "espacio-antes-signo",
  descripcion: "Quitar espacio antes de , . ; : ! ?",
  aplicar(texto, pos) {
    if (pos < 2) return null;
    // Patrón: " [,;:!?.]" justo antes del cursor
    const antes = texto.slice(pos - 2, pos);
    if (!/^[ \t][,;:!?.]$/.test(antes)) return null;
    const nuevo = texto.slice(0, pos - 2) + texto[pos - 1] + texto.slice(pos);
    return { texto: nuevo, offset: -1 };
  },
};

/** Coma sin espacio posterior: "hola,como" → "hola, como" */
const espacioTrasComa = {
  id: "espacio-tras-coma",
  descripcion: "Espacio tras coma si falta",
  aplicar(texto, pos) {
    if (pos < 2) return null;
    const sub = texto.slice(0, pos);
    // Detecta coma seguida inmediatamente de caracteres sin espacio antes del delimitador
    const m = sub.match(/,([^\s,]+)\s*$/);
    if (!m) return null;
    const idx = sub.lastIndexOf("," + m[1]);
    if (idx === -1) return null;
    const nuevo = texto.slice(0, idx + 1) + " " + texto.slice(idx + 1);
    return { texto: nuevo, offset: 1 };
  },
};

/** Puntos suspensivos: "..." → "…" */
const puntosSuspensivos = {
  id: "puntos-suspensivos",
  descripcion: "... → …",
  aplicar(texto, pos) {
    if (pos < 3) return null;
    const sub = texto.slice(0, pos);
    if (!sub.endsWith("...")) return null;
    const nuevo = texto.slice(0, pos - 3) + "…" + texto.slice(pos);
    return { texto: nuevo, offset: -2 };
  },
};

/** Guión doble: "--" → "—" (em dash) */
const guionDoble = {
  id: "guion-doble",
  descripcion: "-- → —",
  aplicar(texto, pos) {
    if (pos < 2) return null;
    const sub = texto.slice(0, pos);
    if (!sub.endsWith("--")) return null;
    const nuevo = texto.slice(0, pos - 2) + "—" + texto.slice(pos);
    return { texto: nuevo, offset: -1 };
  },
};

/** Palabra repetida: "de de " → "de " */
const palabraRepetida = {
  id: "palabra-repetida",
  descripcion: "Palabra consecutiva duplicada → una sola",
  aplicar(texto, pos) {
    // Busca en el texto hasta el cursor
    const sub = texto.slice(0, pos);
    // Patrón: misma palabra dos veces separadas por espacio, antes del delimitador
    const m = sub.match(/\b(\w+)\s+\1\s*$/);
    if (!m) return null;
    const longRepetida = m[0].length;
    const primeraPalabra = m[1];
    const nuevo =
      texto.slice(0, pos - longRepetida) + primeraPalabra + " " + texto.slice(pos);
    return { texto: nuevo, offset: -(longRepetida - primeraPalabra.length - 1) };
  },
};

/** (c) → © */
const copyright = {
  id: "copyright",
  descripcion: "(c) → ©",
  aplicar(texto, pos) {
    const sub = texto.slice(0, pos);
    if (!sub.endsWith("(c)") && !sub.endsWith("(C)")) return null;
    const nuevo = texto.slice(0, pos - 3) + "©" + texto.slice(pos);
    return { texto: nuevo, offset: -2 };
  },
};

/** Lista ordenada de reglas tipográficas */
export const REGLAS_TIPOGRAFICAS = [
  puntosSuspensivos,
  guionDoble,
  copyright,
  espacioAntesSigno,
  doblesEspacio,
  espacioTrasComa,
  palabraRepetida,
];

/**
 * Aplica todas las reglas tipográficas (excepto las rechazadas) al texto.
 * @param {string} texto  Texto completo del campo.
 * @param {number} pos    Posición del cursor (justo después del delimitador escrito).
 * @param {function} estaRechazado  Función (clave) → boolean.
 * @returns {{ texto: string, offset: number, reglaId: string | null }}
 */
export function aplicarReglasTypo(texto, pos, estaRechazado) {
  for (const regla of REGLAS_TIPOGRAFICAS) {
    const clave = `tipo:${regla.id}`;
    if (estaRechazado(clave)) continue;
    const resultado = regla.aplicar(texto, pos);
    if (resultado) {
      return { texto: resultado.texto, offset: resultado.offset, reglaId: regla.id };
    }
  }
  return { texto, offset: 0, reglaId: null };
}
