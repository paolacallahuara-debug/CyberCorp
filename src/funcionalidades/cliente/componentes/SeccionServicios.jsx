import { useMemo } from "react";
import Icono from "../../../componentes/interfaz/Icono";
import { moneda } from "../../../utilidades/formateadores";

export default function SeccionServicios({ datos, consultar }) {
  const lista = useMemo(
    () =>
      datos.servicios
        .filter((servicio) => servicio.activo)
        .sort(
          (a, b) =>
            Number(b.destacado || false) - Number(a.destacado || false) ||
            Number(a.orden || 0) - Number(b.orden || 0),
        ),
    [datos.servicios],
  );

  return (
    <section className="seccion seccion-servicios">
      <div className="titulo-seccion">
        <div>
          <span className="eyebrow">EXPERTOS A TU LADO</span>
          <h2>Nosotros nos encargamos.</h2>
        </div>
        <span className="texto-suave">
          Cotiza instalaciones y asistencia profesional.
        </span>
      </div>

      {lista.length ? (
        <div className="rejilla-servicios">
          {lista.map((servicio, indice) => (
            <button
              className="tarjeta-servicio"
              key={servicio.id}
              onClick={() =>
                consultar(
                  `Hola CyberCorp, quisiera cotizar el servicio ${servicio.nombre}.`,
                  "servicios",
                )
              }
            >
              <div className="visual-servicio">
                {servicio.imagen ? (
                  <img
                    className="imagen-servicio"
                    src={servicio.imagen}
                    alt={servicio.nombre}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="marcador-servicio">
                    <Icono
                      nombre={servicio.icono || "Wrench"}
                      size={58}
                      strokeWidth={1.25}
                    />
                  </div>
                )}
                <span className="numero-servicio">
                  {String(indice + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="contenido-servicio">
                <div className="cabecera-servicio">
                  <Icono nombre={servicio.icono || "Wrench"} size={24} />
                  {servicio.destacado && <span>Destacado</span>}
                </div>
                <h3>{servicio.nombre}</h3>
                <p>{servicio.descripcion}</p>
                <div className="pie-servicio">
                  <small>
                    {servicio.precioDesde != null
                      ? `Desde ${moneda(servicio.precioDesde)}`
                      : "Solicita una cotización"}
                  </small>
                  <span className="enlace">
                    Consultar <Icono nombre="ArrowUpRight" size={17} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="estado-sin-datos">
          Todavía no hay servicios publicados.
        </p>
      )}
    </section>
  );
}
