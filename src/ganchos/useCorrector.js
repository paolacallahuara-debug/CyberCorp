/**
 * useCorrector
 * Gancho que conecta el motor de autocorrección con un elemento DOM
 * (input o textarea no controlado).
 *
 * Funcionalidades:
 *   - Autocorrección al escribir un delimitador (beforeinput/input).
 *   - Memoria de la última corrección para revertir con Backspace/Ctrl+Z.
 *   - Construcción de los items del menú contextual para una palabra.
 *   - Reglas tipográficas con el mismo sistema de deshacer.
 */

import { useCallback, useRef } from "react";
import {
  obtenerSpell,
  iniciarCargaDiccionario,
  agregarPalabraUsuario,
} from "../servicios/diccionario.js";
import {
  corregirPalabra,
  extraerPalabraAntes,
  DELIMITADORES,
} from "../utilidades/autocorreccion/motor.js";
import { aplicarReglasTypo } from "../utilidades/autocorreccion/reglasTipograficas.js";
import { marcarRechazado, estaRechazado } from "../utilidades/autocorreccion/rechazos.js";

// ─── helpers DOM ──────────────────────────────────────────────────────────────

/**
 * Aplica un reemplazo de texto en un elemento input/textarea sin convertirlo
 * en controlado. Usa setRangeText cuando está disponible; fallback execCommand.
 * Despacha un evento "input" para que React y FormData vean el cambio.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} el
 * @param {number} inicio
 * @param {number} fin
 * @param {string} texto
 * @param {number} nuevoCursor
 */
function reemplazarRango(el, inicio, fin, texto, nuevoCursor) {
  if (typeof el.setRangeText === "function") {
    el.setRangeText(texto, inicio, fin, "end");
    el.setSelectionRange(nuevoCursor, nuevoCursor);
  } else {
    // fallback: modifica value directamente
    const anterior = el.value;
    el.value = anterior.slice(0, inicio) + texto + anterior.slice(fin);
    el.setSelectionRange(nuevoCursor, nuevoCursor);
  }
  // Notifica al formulario (FormData lo verá)
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

// ─── useCorrector ─────────────────────────────────────────────────────────────

export default function useCorrector() {
  // Guarda la última corrección aplicada para poder revertirla
  // { inicio, fin, original, corregida, clave }
  const ultimaCorreccion = useRef(null);
  // Flag: el próximo keydown de Backspace/Ctrl+Z puede revertir
  const puedeRevertir = useRef(false);

  /** Inicia la carga del diccionario en el primer focus */
  const alEnfocar = useCallback(() => {
    iniciarCargaDiccionario();
  }, []);

  /**
   * Maneja el evento `input` para autocorrección.
   * Solo actúa cuando se acaba de escribir un delimitador.
   */
  const alEscribir = useCallback((evento) => {
    const el = evento.currentTarget;
    const tipo = evento.inputType;

    // No autocorregir texto pegado
    if (tipo === "insertFromPaste" || tipo === "insertFromDrop") return;

    // Solo actuar si el navegador da datos fiables (no composición Android)
    if (tipo && tipo.startsWith("insertComposition")) return;

    const texto = el.value;
    const pos = el.selectionStart;

    if (!pos || pos === 0) return;

    // Carácter recién escrito
    const ultimoChar = texto[pos - 1];
    if (!DELIMITADORES.has(ultimoChar)) return;

    // Extrae la palabra recién terminada
    const info = extraerPalabraAntes(texto, pos);
    if (!info) return;

    const spell = obtenerSpell();

    // ── Reglas tipográficas (tienen prioridad sobre corrección de palabra) ──
    const { texto: textoTypo, offset: offsetTypo, reglaId } = aplicarReglasTypo(
      texto,
      pos,
      estaRechazado,
    );

    if (reglaId && textoTypo !== texto) {
      // Verifica maxLength
      const maxLength = el.maxLength > 0 ? el.maxLength : Infinity;
      if (textoTypo.length <= maxLength) {
        const nuevaPos = Math.max(0, pos + offsetTypo);
        // Aplica el texto completo reemplazando todo el value
        reemplazarRango(el, 0, texto.length, textoTypo, nuevaPos);

        ultimaCorreccion.current = {
          inicio: nuevaPos - 1,
          fin: nuevaPos,
          original: texto,
          corregida: textoTypo,
          clave: `tipo:${reglaId}`,
          esTextoCompleto: true,
          textoOriginalCompleto: texto,
          nuevaCursorPos: nuevaPos,
        };
        puedeRevertir.current = true;
        return;
      }
    }

    // ── Autocorrección de la palabra ──
    const resultado = corregirPalabra(
      info.palabra,
      texto,
      info.inicio,
      spell,
    );

    if (!resultado) return;
    if (resultado.corregida === info.palabra) return;

    // Verifica maxLength
    const maxLength = el.maxLength > 0 ? el.maxLength : Infinity;
    const textoNuevo =
      texto.slice(0, info.inicio) + resultado.corregida + texto.slice(info.fin);
    if (textoNuevo.length > maxLength) return;

    const delta = resultado.corregida.length - info.palabra.length;
    const nuevaPos = pos + delta;

    reemplazarRango(el, info.inicio, info.fin, resultado.corregida, nuevaPos);

    ultimaCorreccion.current = {
      inicio: info.inicio,
      fin: info.inicio + resultado.corregida.length,
      original: info.palabra,
      corregida: resultado.corregida,
      clave: resultado.clave,
      esTextoCompleto: false,
      nuevaCursorPos: nuevaPos,
    };
    puedeRevertir.current = true;
  }, []);

  /**
   * Maneja Backspace y Ctrl/Cmd+Z para revertir la última autocorrección.
   */
  const alPresionarTecla = useCallback((evento) => {
    const el = evento.currentTarget;

    if (!puedeRevertir.current || !ultimaCorreccion.current) return;

    const esDeshacer =
      (evento.ctrlKey || evento.metaKey) && evento.key === "z";
    const esBackspace = evento.key === "Backspace";

    if (!esDeshacer && !esBackspace) {
      // Cualquier otra tecla que no sea de navegación anula la posibilidad de revertir
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Shift", "Control", "Meta", "Alt"].includes(evento.key)) {
        puedeRevertir.current = false;
        ultimaCorreccion.current = null;
      }
      return;
    }

    const ult = ultimaCorreccion.current;
    const pos = el.selectionStart;

    // Verifica que el cursor esté al final de la palabra corregida o justo tras el delimitador
    const dentroDeRango = pos >= ult.inicio && pos <= ult.fin + 1;
    if (!dentroDeRango) {
      puedeRevertir.current = false;
      return;
    }

    evento.preventDefault();

    if (ult.esTextoCompleto) {
      // Revertir texto completo
      reemplazarRango(el, 0, el.value.length, ult.textoOriginalCompleto, ult.inicio + 1);
    } else {
      // Revertir la palabra
      const texto = el.value;
      if (esBackspace && pos === ult.fin + 1) {
        // Al presionar Backspace inmediatamente tras el delimitador:
        // revierte la palabra y elimina el delimitador recién tecleado
        const textoRevertido =
          texto.slice(0, ult.inicio) + ult.original + texto.slice(pos);
        const nuevaPos = ult.inicio + ult.original.length;
        reemplazarRango(el, 0, texto.length, textoRevertido, nuevaPos);
      } else {
        // Ctrl+Z o Backspace en el borde de la palabra: conserva lo que sigue
        const textoRevertido =
          texto.slice(0, ult.inicio) + ult.original + texto.slice(ult.fin);
        const nuevaPos = ult.inicio + ult.original.length;
        reemplazarRango(el, 0, texto.length, textoRevertido, nuevaPos);
      }
    }

    // Marcar como rechazada permanentemente
    if (ult.clave) {
      marcarRechazado(ult.clave);
    }

    puedeRevertir.current = false;
    ultimaCorreccion.current = null;
  }, []);

  /**
   * Construye los items del menú contextual para la palabra bajo el cursor.
   * @param {string} palabra
   * @param {string} textoCompleto
   * @param {number} inicioPalabra
   * @param {HTMLInputElement|HTMLTextAreaElement} el
   * @returns {Array<{ tipo, etiqueta, accion }>}
   */
  const itemsMenuContextual = useCallback((palabra, textoCompleto, inicioPalabra, el) => {
    const spell = obtenerSpell();
    const items = [];

    if (!spell) return items;

    const esValida = spell.correct(palabra) || estaRechazado(`ignorar:${palabra.toLowerCase()}`);
    if (esValida) return items; // Palabra correcta o ignorada: menú normal del navegador

    const sugerencias = spell.suggest(palabra).slice(0, 5);

    for (const sug of sugerencias) {
      items.push({
        tipo: "sugerencia",
        etiqueta: sug,
        accion: () => {
          if (!el) return;
          const fin = inicioPalabra + palabra.length;
          const nuevaPos = inicioPalabra + sug.length;
          reemplazarRango(el, inicioPalabra, fin, sug, nuevaPos);
        },
      });
    }

    items.push({
      tipo: "separador",
    });

    items.push({
      tipo: "accion",
      etiqueta: "Agregar al diccionario",
      accion: () => {
        agregarPalabraUsuario(palabra);
      },
    });

    items.push({
      tipo: "accion",
      etiqueta: "Ignorar",
      accion: () => {
        marcarRechazado(`ignorar:${palabra.toLowerCase()}`);
      },
    });

    return items;
  }, []);

  return {
    alEnfocar,
    alEscribir,
    alPresionarTecla,
    itemsMenuContextual,
  };
}
