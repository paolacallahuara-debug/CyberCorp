/**
 * CampoCorregido
 * Input o textarea NO controlado con corrector ortográfico y menú contextual.
 *
 * Props:
 *   multiline   {boolean}   Si true, renderiza <textarea>; si no, <input>.
 *   ref         {React.Ref} Ref al elemento DOM subyacente.
 *   + todas las props nativas de <input> o <textarea>:
 *     name, defaultValue, maxLength, required, placeholder, etc.
 *
 * Garantías:
 *   - El campo NO es controlado: FormData lee el texto ya corregido.
 *   - spellCheck y lang="es" para conservar el subrayado rojo nativo.
 *   - No hay setState en el render ni lectura de ref.current durante el render.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import useCorrector from "../../ganchos/useCorrector.js";
import { obtenerSpell } from "../../servicios/diccionario.js";
import { revisarConLanguageTool } from "../../servicios/languagetool.js";
import { detectarHomofono } from "../../utilidades/autocorreccion/motor.js";
import "../../estilos/corrector.css";

// ─── Menú contextual ──────────────────────────────────────────────────────────

function MenuContextual({ x, y, items, nota, alCerrar }) {
  const menuRef = useRef(null);
  const [focoIdx, setFocoIdx] = useState(-1);

  // Cierra con click fuera o Escape
  useEffect(() => {
    function alClickFuera(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        alCerrar();
      }
    }
    function alEscape(e) {
      if (e.key === "Escape") alCerrar();
    }
    document.addEventListener("mousedown", alClickFuera, true);
    document.addEventListener("keydown", alEscape, true);
    return () => {
      document.removeEventListener("mousedown", alClickFuera, true);
      document.removeEventListener("keydown", alEscape, true);
    };
  }, [alCerrar]);

  // Foco automático al montar
  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  // Navegación con flechas y Enter
  const itemsAccionables = items.filter((it) => it.tipo !== "separador");

  function alTecla(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocoIdx((i) => Math.min(i + 1, itemsAccionables.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocoIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focoIdx >= 0) {
      e.preventDefault();
      itemsAccionables[focoIdx]?.accion?.();
      alCerrar();
    }
  }

  // Ajusta posición para que no salga de la ventana
  const [pos, setPos] = useState({ left: x, top: y });
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({
      left: Math.min(x, vw - rect.width - 8),
      top: Math.min(y, vh - rect.height - 8),
    });
  }, [x, y]);

  let accionableIdx = 0;

  return createPortal(
    <ul
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      className="corrector-menu"
      style={{ left: pos.left, top: pos.top }}
      onKeyDown={alTecla}
    >
      {items.length > 0 && (
        <li className="corrector-menu-encabezado" role="presentation">
          Sugerencias
        </li>
      )}
      {items.map((item, idx) => {
        if (item.tipo === "separador") {
          return <li key={idx} role="separator" className="corrector-menu-separador" />;
        }
        const miIdx = accionableIdx++;
        return (
          <li key={idx} role="presentation">
            <button
              role="menuitem"
              className={`corrector-menu-item ${item.tipo}`}
              data-foco={focoIdx === miIdx ? "true" : undefined}
              onMouseEnter={() => setFocoIdx(miIdx)}
              onClick={() => {
                item.accion?.();
                alCerrar();
              }}
            >
              {item.etiqueta}
            </button>
          </li>
        );
      })}
      {nota && (
        <li className="corrector-menu-nota-homofonos" role="presentation">
          {nota}
        </li>
      )}
    </ul>,
    document.body,
  );
}

// ─── Resultados LanguageTool ──────────────────────────────────────────────────

function ResultadosLT({ resultados, texto, alAplicar }) {
  if (!resultados?.length) return null;
  return (
    <div className="lt-resultados">
      {resultados.map((r, i) => (
        <div key={i} className="lt-resultado-item">
          <div className="lt-resultado-mensaje">
            {r.descripcion || r.mensaje}
            {" "}
            <span style={{ opacity: 0.55, fontSize: "11px" }}>
              (pos. {r.offset})
            </span>
          </div>
          {r.sugerencias.length > 0 && (
            <div className="lt-resultado-sugerencias">
              {r.sugerencias.map((sug, si) => (
                <button
                  key={si}
                  type="button"
                  className="lt-sugerencia-btn"
                  onClick={() => alAplicar(r, sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

/**
 * Extrae la palabra bajo la posición del cursor en el texto.
 * @param {string} texto
 * @param {number} pos
 */
function palabraEnPosicion(texto, pos) {
  if (pos < 0 || pos > texto.length) return null;
  // Busca inicio y fin de la palabra
  let inicio = pos;
  let fin = pos;
  while (inicio > 0 && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(texto[inicio - 1])) inicio--;
  while (fin < texto.length && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(texto[fin])) fin++;
  if (inicio === fin) return null;
  return { palabra: texto.slice(inicio, fin), inicio, fin };
}

/**
 * Obtiene la posición del cursor en el texto a partir de coordenadas de pantalla.
 * @param {HTMLElement} el
 * @param {number} clientX
 * @param {number} clientY
 * @returns {number}
 */
function posicionDesdePunto(el, clientX, clientY) {
  // Preferencia: selectionStart si el elemento tiene foco
  if (document.activeElement === el && el.selectionStart != null) {
    return el.selectionStart;
  }
  // Fallback: caretPositionFromPoint / caretRangeFromPoint
  if (document.caretPositionFromPoint) {
    const cp = document.caretPositionFromPoint(clientX, clientY);
    return cp?.offset ?? 0;
  }
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(clientX, clientY);
    return range?.startOffset ?? 0;
  }
  return 0;
}

// ─── CampoCorregido ───────────────────────────────────────────────────────────

const CampoCorregido = forwardRef(function CampoCorregido(
  { multiline = false, ...props },
  refExterna,
) {
  const refInterna = useRef(null);

  // Expone el elemento DOM al padre (para que FormData lo lea)
  useImperativeHandle(refExterna, () => refInterna.current, []);

  const { alEnfocar, alEscribir, alPresionarTecla, itemsMenuContextual } =
    useCorrector();

  // ── Estado del menú contextual ──
  const [menu, setMenu] = useState(null);
  // { x, y, items, nota }

  // ── Estado LanguageTool ──
  const [ltCargando, setLtCargando] = useState(false);
  const [ltResultados, setLtResultados] = useState(null);

  // Aplica una sugerencia de LanguageTool directamente en el campo
  const aplicarSugerenciaLT = useCallback((resultado, sugerencia) => {
    const el = refInterna.current;
    if (!el) return;
    const texto = el.value;
    const nuevoTexto =
      texto.slice(0, resultado.offset) +
      sugerencia +
      texto.slice(resultado.offset + resultado.largo);
    el.value = nuevoTexto;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    // Actualiza resultados eliminando el aplicado
    setLtResultados((prev) => prev?.filter((r) => r !== resultado) ?? null);
  }, []);

  // ── Menú contextual ──────────────────────────────────────────────────────
  const alContextMenu = useCallback(
    (e) => {
      const el = refInterna.current;
      if (!el) return;

      const spell = obtenerSpell();

      // Detecta la palabra con selectionStart y, si falla, con la posición del click
      let pos = el.selectionStart ?? 0;
      let info = palabraEnPosicion(el.value, pos);
      if (!info) {
        pos = posicionDesdePunto(el, e.clientX, e.clientY);
        info = palabraEnPosicion(el.value, pos);
      }

      // Revisa si el click cae sobre un rango marcado por LanguageTool
      const coincidenciaLT = ltResultados?.find(
        (r) => pos >= r.offset && pos <= r.offset + r.largo,
      );

      let items = [];

      if (info && spell) {
        items = itemsMenuContextual(
          info.palabra,
          el.value,
          info.inicio,
          el,
        );
      }

      // Suma sugerencias de LanguageTool si el click cayó sobre su rango
      if (coincidenciaLT && coincidenciaLT.sugerencias?.length > 0) {
        const itemsLT = coincidenciaLT.sugerencias.slice(0, 5).map((sug) => ({
          tipo: "sugerencia",
          etiqueta: `${sug} (revisión gramatical)`,
          accion: () => aplicarSugerenciaLT(coincidenciaLT, sug),
        }));

        if (items.length > 0) {
          items = [...itemsLT, { tipo: "separador" }, ...items];
        } else {
          items = itemsLT;
        }
      }

      // Si no hay items del corrector ni de LanguageTool, permitir menú nativo
      if (items.length === 0) return;

      e.preventDefault();

      // Nota de homófonos (sobre todo el texto)
      const homofonos = detectarHomofono(el.value);

      setMenu({
        x: e.clientX,
        y: e.clientY,
        items,
        nota: homofonos?.nota ?? null,
      });
    },
    [itemsMenuContextual, ltResultados, aplicarSugerenciaLT],
  );

  const cerrarMenu = useCallback(() => setMenu(null), []);

  // ── Revisar texto con LanguageTool ───────────────────────────────────────
  const revisarTexto = useCallback(async () => {
    const el = refInterna.current;
    if (!el) return;
    const texto = el.value.trim();
    if (!texto) return;

    setLtCargando(true);
    setLtResultados(null);

    try {
      const resultados = await revisarConLanguageTool(texto);
      setLtResultados(resultados);
      if (resultados.length === 0) {
        toast.success("No se encontraron errores gramaticales.");
      }
    } catch (err) {
      toast.warning(err.message || "No se pudo conectar al revisor gramatical.");
    } finally {
      setLtCargando(false);
    }
  }, []);

  // ── Props del elemento DOM ───────────────────────────────────────────────
  const propsElemento = {
    ...props,
    ref: refInterna,
    spellCheck: true,
    lang: "es",
    onFocus: alEnfocar,
    onInput: alEscribir,
    onKeyDown: alPresionarTecla,
    onContextMenu: alContextMenu,
  };

  return (
    <>
      {multiline ? (
        <textarea {...propsElemento} />
      ) : (
        <input {...propsElemento} />
      )}

      {/* Botón "Revisar texto" solo en textarea */}
      {multiline && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <button
            type="button"
            className="btn-revisar-texto"
            disabled={ltCargando}
            onClick={revisarTexto}
          >
            {ltCargando ? "Revisando…" : "✦ Revisar gramática"}
          </button>
          <span className="btn-revisar-texto-aviso">
            El texto se envía a LanguageTool (servicio externo)
          </span>
          <ResultadosLT
            resultados={ltResultados}
            texto={refInterna.current?.value ?? ""}
            alAplicar={aplicarSugerenciaLT}
          />
        </div>
      )}

      {/* Menú contextual */}
      {menu && (
        <MenuContextual
          x={menu.x}
          y={menu.y}
          items={menu.items}
          nota={menu.nota}
          alCerrar={cerrarMenu}
        />
      )}
    </>
  );
});

export default CampoCorregido;
