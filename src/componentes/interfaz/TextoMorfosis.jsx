import { useId } from "react";
import { cn } from "../../utilidades/clases";

export default function TextoMorfosis({
  frases = [],
  indiceActivo = 0,
  className = "",
}) {
  const id = useId().replace(/:/g, "");
  const filtroId = `filtro-morfosis-${id}`;

  return (
    <h1
      className={cn("texto-morfosis", className)}
      aria-live="polite"
    >
      <svg
        className="texto-morfosis-filtro"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={filtroId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 25 -9
              "
              result="morfosis"
            />

            <feComposite
              in="SourceGraphic"
              in2="morfosis"
              operator="atop"
            />
          </filter>
        </defs>
      </svg>

      <span
        className="texto-morfosis-contenedor"
        style={{
          filter: `url(#${filtroId})`,
        }}
      >
        {frases.map((frase, indice) => {
          const activa = indice === indiceActivo;

          return (
            <span
              key={indice}
              className={cn(
                "texto-morfosis-frase",
                activa && "texto-morfosis-frase-activa",
              )}
              aria-hidden={!activa}
            >
              {frase}
            </span>
          );
        })}
      </span>

      <style>{`
        .texto-morfosis {
          position: relative;
        }

        .texto-morfosis-filtro {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .texto-morfosis-contenedor {
          display: grid;
          position: relative;
        }

        .texto-morfosis-frase {
          grid-area: 1 / 1;
          display: block;

          opacity: 0;

          filter: blur(18px);

          transform:
            translateY(8px)
            scale(0.96);

          transition:
            opacity 0.55s ease,
            filter 0.65s ease,
            transform 0.65s ease;

          pointer-events: none;
        }

        .texto-morfosis-frase-activa {
          opacity: 1;

          filter: blur(0);

          transform:
            translateY(0)
            scale(1);

          pointer-events: auto;
        }

        @media (prefers-reduced-motion: reduce) {
          .texto-morfosis-frase {
            transition: none;
          }
        }
      `}</style>
    </h1>
  );
}