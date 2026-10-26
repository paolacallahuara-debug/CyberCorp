import { useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";

export default function EfectoHoverTarjetas({
  elementos = [],
  renderizar,
  className = "",
}) {
  const [indiceActivo, setIndiceActivo] = useState(null);
  const reducirMovimiento = useReducedMotion();

  return (
    <LayoutGroup id="productos-hover">
      <div
        className={`contenedor-efecto-hover-productos ${className}`}
        onMouseLeave={() => setIndiceActivo(null)}
      >
        {elementos.map((elemento, indice) => (
          <div
            key={elemento.id}
            className="envoltura-hover-producto"
            onMouseEnter={() => setIndiceActivo(indice)}
            onFocusCapture={() => setIndiceActivo(indice)}
            onBlurCapture={(evento) => {
              if (
                !evento.currentTarget.contains(
                  evento.relatedTarget,
                )
              ) {
                setIndiceActivo(null);
              }
            }}
          >
            <AnimatePresence mode="sync">
              {indiceActivo === indice && (
                <motion.span
                  layoutId="fondo-hover-productos"
                  className="fondo-hover-producto"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={
                    reducirMovimiento
                      ? {
                          duration: 0,
                        }
                      : {
                          opacity: {
                            duration: 0.22,
                            ease: "easeOut",
                          },

                          layout: {
                            type: "spring",
                            stiffness: 145,
                            damping: 22,
                            mass: 0.9,
                          },
                        }
                  }
                />
              )}
            </AnimatePresence>

            <div className="contenido-hover-producto">
              {renderizar(elemento)}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}