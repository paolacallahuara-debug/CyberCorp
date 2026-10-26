import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import Icono from "./Icono";
import { cn } from "../../utilidades/clases";

export default function ConveniosAnimados({
  convenios = [],
  reproduccionAutomatica = true,
  intervalo = 5000,
  className = "",
}) {
  const [activo, setActivo] = useState(0);
  const reducirMovimiento = useReducedMotion();

  const cantidad = convenios.length;

  const siguiente = () => {
    setActivo((actual) =>
      cantidad ? (actual + 1) % cantidad : 0,
    );
  };

  const anterior = () => {
    setActivo((actual) =>
      cantidad ? (actual - 1 + cantidad) % cantidad : 0,
    );
  };

  useEffect(() => {
    if (activo >= cantidad) {
      setActivo(0);
    }
  }, [activo, cantidad]);

  useEffect(() => {
    if (
      !reproduccionAutomatica ||
      cantidad <= 1 ||
      reducirMovimiento
    ) {
      return;
    }

    const temporizador = window.setInterval(() => {
      setActivo((actual) => (actual + 1) % cantidad);
    }, intervalo);

    return () => {
      window.clearInterval(temporizador);
    };
  }, [
    reproduccionAutomatica,
    intervalo,
    cantidad,
    reducirMovimiento,
  ]);

  if (!cantidad) {
    return null;
  }

  const convenioActivo = convenios[activo];

  function rotacion(index) {
    const rotaciones = [-7, 6, -4, 8, -6, 4];

    return rotaciones[index % rotaciones.length];
  }

  return (
    <div
      className={cn(
        "convenios-animados",
        className,
      )}
    >
      {/* IMÁGENES */}
      <div className="convenios-animados-visual">
        <div className="convenios-animados-imagenes">
          {convenios.map((convenio, index) => {
            const seleccionado = index === activo;

            return (
              <motion.div
                key={convenio.id}
                className="convenio-animado-imagen-contenedor"
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  rotate: reducirMovimiento
                    ? 0
                    : rotacion(index),
                }}
                animate={{
                  opacity: seleccionado ? 1 : 0.55,
                  scale: seleccionado ? 1 : 0.94,

                  rotate:
                    reducirMovimiento || seleccionado
                      ? 0
                      : rotacion(index),

                  y:
                    reducirMovimiento || !seleccionado
                      ? 0
                      : [0, -12, 0],

                  zIndex: seleccionado
                    ? 40
                    : cantidad + 2 - index,
                }}
                transition={{
                  duration: reducirMovimiento ? 0 : 0.45,
                  ease: "easeInOut",
                }}
              >
                {convenio.imagen ? (
                  <img
                    src={convenio.imagen}
                    alt={convenio.titulo}
                    className="convenio-animado-imagen"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ) : (
                  <div className="convenio-animado-sin-imagen">
                    <Icono
                      nombre="Handshake"
                      size={74}
                      strokeWidth={1.2}
                    />

                    <span>
                      {convenio.titulo}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="contador-convenio-animado">
          <strong>
            {String(activo + 1).padStart(2, "0")}
          </strong>

          <span>
            / {String(cantidad).padStart(2, "0")}
          </span>
        </div>
        {cantidad > 1 && (
          <div className="controles-convenios-animados controles-convenios-movil">
            <button
              type="button"
              onClick={anterior}
              aria-label="Convenio anterior"
            >
              <Icono
                nombre="ChevronLeft"
                size={20}
              />
            </button>

            <button
              type="button"
              onClick={siguiente}
              aria-label="Siguiente convenio"
            >
              <Icono
                nombre="ChevronRight"
                size={20}
              />
            </button>
          </div>
        )}
      </div>

      {/* INFORMACIÓN */}
      <div className="convenios-animados-columna-info">

        <div className="convenios-animados-contenido">
          <motion.div
            key={convenioActivo.id}
            className="convenio-animado-informacion"
            initial={
              reducirMovimiento
                ? false
                : {
                  opacity: 0,
                  y: 20,
                }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reducirMovimiento ? 0 : 0.35,
              ease: "easeOut",
            }}
          >
            <span className="etiqueta-convenio-animado">
              BENEFICIO / CONVENIO
            </span>

            <h3>
              {convenioActivo.titulo}
            </h3>

            <p className="descripcion-convenio-animado">
              {convenioActivo.descripcion
                ?.split(/\s+/)
                .map((palabra, index) => (
                  <motion.span
                    key={`${convenioActivo.id}-${index}`}
                    className="palabra-convenio-animado"
                    initial={
                      reducirMovimiento
                        ? false
                        : {
                          filter: "blur(8px)",
                          opacity: 0,
                          y: 5,
                        }
                    }
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: reducirMovimiento
                        ? 0
                        : 0.2,

                      delay: reducirMovimiento
                        ? 0
                        : Math.min(index * 0.018, 0.6),
                    }}
                  >
                    {palabra}{" "}
                  </motion.span>
                ))}
            </p>

            {convenioActivo.enlaceUrl && (
              <a
                className="enlace-convenio-animado"
                href={convenioActivo.enlaceUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Más información

                <Icono
                  nombre="ArrowUpRight"
                  size={16}
                />
              </a>
            )}
          </motion.div>
        </div>


        {cantidad > 1 && (
          <div className="controles-convenios-animados controles-convenios-escritorio">
            <button
              type="button"
              onClick={anterior}
              aria-label="Convenio anterior"
            >
              <Icono
                nombre="ChevronLeft"
                size={20}
              />
            </button>

            <button
              type="button"
              onClick={siguiente}
              aria-label="Siguiente convenio"
            >
              <Icono
                nombre="ChevronRight"
                size={20}
              />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}