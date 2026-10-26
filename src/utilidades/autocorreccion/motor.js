/**
 * Motor de autocorrección.
 * Orden de decisión por palabra:
 *   1. Lista propia (correccionesPropias.js) — antes del diccionario.
 *   2. Tildes con nspell — solo si la palabra NO es válida y exactamente
 *      una variante con tilde es válida.
 *   3. Mayúscula inicial — primera palabra del texto, tras ". ", "! ", "? ",
 *      tras salto de línea. No capitaliza tras abreviaturas ni tras números.
 *
 * Ignorados siempre:
 *   - Emails, URLs, hashtags, palabras con números o guiones bajos.
 *   - Palabras pegadas a @ / # _ -.
 *   - Palabras de 1 letra.
 *   - Texto pegado (se detecta desde useCorrector.js).
 */

import {
  CORRECCIONES_PROPIAS,
  SIEMPRE_MAYUSCULAS,
  DIAS_Y_MESES,
} from "./correccionesPropias.js";
import { estaRechazado } from "./rechazos.js";

// Abreviaturas tras las cuales NO se capitaliza
const ABREVIATURAS = new Set([
  "sr", "sra", "dr", "dra", "ing", "lic", "prof", "profa",
  "etc", "pág", "pag", "ej", "aprox", "tel", "núm", "num",
  "vs", "art", "cap", "fig", "pp", "vol", "ed",
  "av", "col", "cta", "dpto", "dto",
]);

// Delimitadores que activan la autocorrección
export const DELIMITADORES = new Set([
  " ", ".", ",", ";", ":", "!", "?", ")", "]", '"', "»", "\n", "\r",
]);

/**
 * Detecta si un carácter es una vocal sin tilde.
 */
const VOCALES_SIN_TILDE = "aeiouAEIOU";
const VARIANTES_TILDE = {
  a: ["á"], e: ["é"], i: ["í"], o: ["ó"], u: ["ú"],
  A: ["Á"], E: ["É"], I: ["Í"], O: ["Ó"], U: ["Ú"],
};

/**
 * Genera todas las variantes de una palabra con tilde en cada vocal.
 * @param {string} palabra
 * @returns {string[]}
 */
function variantesConTilde(palabra) {
  const variantes = [];
  for (let i = 0; i < palabra.length; i++) {
    const ch = palabra[i];
    if (VOCALES_SIN_TILDE.includes(ch)) {
      for (const tilded of (VARIANTES_TILDE[ch] ?? [])) {
        variantes.push(palabra.slice(0, i) + tilded + palabra.slice(i + 1));
      }
    }
  }
  return variantes;
}

/**
 * Aplica el estilo de capitalización de la palabra original a la corrección.
 * - MAYÚSCULAS → MAYÚSCULAS
 * - Capitalizada → Capitalizada
 * - minúscula → minúscula
 * @param {string} original
 * @param {string} correccion
 */
function aplicarEstiloCapital(original, correccion) {
  if (original === original.toUpperCase() && original.length > 1) {
    return correccion.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    // Primera letra mayúscula
    return correccion[0].toUpperCase() + correccion.slice(1);
  }
  return correccion;
}

/**
 * Devuelve true si la palabra debe ignorarse (email, URL, hashtag, números, etc.)
 * @param {string} palabra
 * @param {string} textoAntes  Texto antes de la palabra en el campo.
 */
function debeIgnorarse(palabra) {
  if (palabra.length <= 1) return true;
  if (/[@#_]/.test(palabra)) return true;
  if (/^https?:\/\//i.test(palabra)) return true;
  if (/^www\./i.test(palabra)) return true;
  if (/[0-9]/.test(palabra)) return true;
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(palabra)) return true;
  if (/[-_]/.test(palabra)) return true;
  return false;
}

/**
 * Determina si la posición `pos` en el texto está al inicio de una oración.
 * @param {string} texto
 * @param {number} pos  Índice del inicio de la palabra.
 */
function esInicioOracion(texto, pos) {
  if (pos === 0) return true;

  // Busca hacia atrás ignorando espacios, ¿, ¡, (, ", «, "
  let i = pos - 1;
  while (i >= 0 && /[\s¿¡("«"]/.test(texto[i])) i--;

  if (i < 0) return true;

  const ch = texto[i];

  // Tras ., !, ? es inicio de oración
  if (!/[.!?]/.test(ch)) return false;

  // Pero NO tras número seguido de punto ("1. algo")
  if (ch === "." && i > 0 && /[0-9]/.test(texto[i - 1])) return false;

  // Extrae la palabra antes del signo para verificar abreviatura
  let fin = i;
  let ini = fin;
  while (ini > 0 && /[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/.test(texto[ini - 1])) ini--;
  const palabraAntes = texto.slice(ini, fin).toLowerCase();
  if (ABREVIATURAS.has(palabraAntes)) return false;

  return true;
}

/**
 * Corrección de una sola palabra con el motor completo.
 *
 * @param {string} palabra           La palabra a corregir (sin el delimitador).
 * @param {string} textoCompleto     El texto completo del campo.
 * @param {number} inicioPalabra     Índice donde empieza la palabra en textoCompleto.
 * @param {object|null} spell        Instancia de nspell, o null si aún no cargó.
 * @returns {{ corregida: string, clave: string | null } | null}
 *          null si no hay corrección que aplicar.
 */
export function corregirPalabra(palabra, textoCompleto, inicioPalabra, spell) {
  if (debeIgnorarse(palabra)) return null;

  const minuscula = palabra.toLowerCase();

  // ── 1. Lista propia ──────────────────────────────────────────────
  const correccionPropia = CORRECCIONES_PROPIAS[palabra] ?? CORRECCIONES_PROPIAS[minuscula];
  if (correccionPropia !== undefined) {
    const clave = `prop:${minuscula}`;
    if (estaRechazado(clave)) {
      // Rechazado; aún podemos seguir con tildes y mayúsculas
    } else {
      // Acrónimos: siempre mayúsculas
      if (SIEMPRE_MAYUSCULAS.has(minuscula)) {
        return { corregida: correccionPropia, clave };
      }
      // Días y meses: solo si NO es inicio de oración
      if (DIAS_Y_MESES.has(minuscula)) {
        if (!esInicioOracion(textoCompleto, inicioPalabra)) {
          return { corregida: correccionPropia, clave };
        }
        // Si está al inicio de oración, no corregimos el día/mes
      } else {
        // Corrección normal: respeta estilo de capitalización
        const corregida = aplicarEstiloCapital(palabra, correccionPropia);
        return { corregida, clave };
      }
    }
  }

  // ── 2. Tildes con nspell ─────────────────────────────────────────
  if (spell) {
    // Solo si la palabra no tiene tilde ya y no es válida
    const yaValida = spell.correct(palabra);
    if (!yaValida) {
      const variantes = variantesConTilde(minuscula);
      const validas = variantes.filter((v) => spell.correct(v));
      if (validas.length === 1) {
        const clave = `ort:${minuscula}`;
        if (!estaRechazado(clave)) {
          const corregida = aplicarEstiloCapital(palabra, validas[0]);
          return { corregida, clave };
        }
      }
    }
  }

  // ── 3. Mayúscula inicial ─────────────────────────────────────────
  if (esInicioOracion(textoCompleto, inicioPalabra)) {
    const primeraLetra = palabra[0];
    if (primeraLetra !== primeraLetra.toUpperCase()) {
      const clave = `mayus:${minuscula}`;
      if (!estaRechazado(clave)) {
        const corregida = primeraLetra.toUpperCase() + palabra.slice(1);
        return { corregida, clave };
      }
    }
  }

  return null;
}

/**
 * Extrae la palabra recién terminada antes del delimitador escrito.
 * @param {string} texto
 * @param {number} posCursor  Posición del cursor (después del delimitador).
 * @returns {{ palabra: string, inicio: number, fin: number } | null}
 */
export function extraerPalabraAntes(texto, posCursor) {
  // Retrocede desde el delimitador
  let fin = posCursor - 1; // posición del delimitador
  if (fin < 0) return null;
  let inicio = fin - 1;
  // Busca el inicio de la palabra
  while (inicio > 0 && !DELIMITADORES.has(texto[inicio - 1])) inicio--;
  if (inicio >= fin) return null;
  const palabra = texto.slice(inicio, fin);
  if (!palabra.trim()) return null;
  return { palabra, inicio, fin };
}

/**
 * Reglas de homófonos: devuelve una nota si detecta una confusión común.
 * Solo para sugerir en el menú, NUNCA para autocorregir.
 * @param {string} texto
 * @returns {{ nota: string } | null}
 */
export function detectarHomofono(texto) {
  const reglas = [
    { patron: /\bno se (qu[eé]|c[oó]mo|cu[aá]ndo|d[oó]nde)\b/i, nota: '¿Quisiste escribir "no sé"?' },
    { patron: /\bvoy a haber\b/i, nota: '¿Quisiste escribir "voy a ver"?' },
    { patron: /\ba que\b(?! no)/i, nota: '¿Quisiste escribir "a ver" o "a que"? Verifica el contexto.' },
    { patron: /\becho de menos\b/i, nota: '✓ Correcto: "echo de menos"' },
    { patron: /\bhai\b/i, nota: '¿Quisiste escribir "hay" o "ahí"?' },
    { patron: /\btubo\b/i, nota: '¿Quisiste escribir "tuvo" (verbo) o "tubo" (objeto)?'},
  ];
  for (const { patron, nota } of reglas) {
    if (patron.test(texto)) return { nota };
  }
  return null;
}
