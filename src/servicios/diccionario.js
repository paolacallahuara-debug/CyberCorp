/**
 * Servicio singleton del diccionario nspell en español.
 *
 * Estrategia de carga:
 *   - Se inicia en requestIdleCallback (o setTimeout si no está disponible).
 *   - Los archivos se sirven desde /diccionario/es.aff y /diccionario/es.dic,
 *     copiados por scripts/copiar-diccionario.js antes de cada dev/build.
 *   - Mientras no está listo, `obtenerSpell()` devuelve null; el campo funciona
 *     normalmente sin corrección del diccionario.
 *   - nspell necesita strings (no Uint8Array), por eso se usa TextDecoder.
 *   - Las palabras propias del negocio se agregan con spell.add() al inicializar.
 *   - Las palabras del usuario (localStorage) también se agregan.
 */

import nspell from "nspell";
import { PALABRAS_PROPIAS } from "../utilidades/autocorreccion/diccionarioPropio.js";

const STORAGE_KEY_PALABRAS = "autocorreccion:palabras-usuario";

let spellInstance = null;
let cargando = false;
let promesaCarga = null;

/** Lee las palabras agregadas por el usuario desde localStorage */
function leerPalabrasUsuario() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PALABRAS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Guarda una palabra nueva del usuario en localStorage */
export function agregarPalabraUsuario(palabra) {
  try {
    const palabras = leerPalabrasUsuario();
    if (!palabras.includes(palabra)) {
      palabras.push(palabra);
      localStorage.setItem(STORAGE_KEY_PALABRAS, JSON.stringify(palabras));
    }
    // Si el spell ya está cargado, agrégala inmediatamente
    if (spellInstance) {
      spellInstance.add(palabra);
    }
  } catch {
    // nada
  }
}

/**
 * Carga el diccionario desde /diccionario/es.aff y /diccionario/es.dic.
 * Decodifica con TextDecoder porque nspell necesita strings, no Uint8Array.
 * @returns {Promise<void>}
 */
async function cargarDiccionario() {
  if (spellInstance || cargando) return;
  cargando = true;

  try {
    const decoder = new TextDecoder("utf-8");

    const [affRes, dicRes] = await Promise.all([
      fetch("/diccionario/es.aff"),
      fetch("/diccionario/es.dic"),
    ]);

    if (!affRes.ok || !dicRes.ok) {
      console.warn("[diccionario] No se pudieron cargar los archivos del diccionario.");
      return;
    }

    const [affBuf, dicBuf] = await Promise.all([
      affRes.arrayBuffer(),
      dicRes.arrayBuffer(),
    ]);

    const aff = decoder.decode(affBuf);
    const dic = decoder.decode(dicBuf);

    spellInstance = nspell({ aff, dic });

    // Agregar palabras propias del negocio
    for (const palabra of PALABRAS_PROPIAS) {
      spellInstance.add(palabra);
    }

    // Agregar palabras del usuario almacenadas
    for (const palabra of leerPalabrasUsuario()) {
      spellInstance.add(palabra);
    }

    console.info("[diccionario] ✓ Diccionario español cargado");
  } catch (err) {
    console.warn("[diccionario] Error al cargar:", err);
  } finally {
    cargando = false;
  }
}

/**
 * Inicia la carga diferida del diccionario.
 * Llama en el primer `focus` de un CampoCorregido o en requestIdleCallback.
 */
export function iniciarCargaDiccionario() {
  if (spellInstance || cargando || promesaCarga) return;
  promesaCarga = cargarDiccionario();
}

/**
 * Inicia la carga en requestIdleCallback (o setTimeout como fallback).
 * Se puede llamar en cuanto el panel de admin monta.
 */
export function iniciarCargaInactiva() {
  if (spellInstance || cargando || promesaCarga) return;
  const arrancar = () => { promesaCarga = cargarDiccionario(); };
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(arrancar, { timeout: 3000 });
  } else {
    setTimeout(arrancar, 500);
  }
}

/**
 * Devuelve la instancia de nspell si ya está disponible, o null.
 * No bloquea; los campos funcionan sin corrección mientras tanto.
 * @returns {import("nspell").NSpell | null}
 */
export function obtenerSpell() {
  return spellInstance;
}

/**
 * Devuelve una promesa que se resuelve cuando el diccionario esté listo.
 * Útil para esperar en tests o en botones de "revisar texto".
 * @returns {Promise<import("nspell").NSpell | null>}
 */
export async function esperarSpell() {
  if (spellInstance) return spellInstance;
  if (!promesaCarga) promesaCarga = cargarDiccionario();
  await promesaCarga;
  return spellInstance;
}
