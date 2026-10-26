import { useMemo } from "react";
import Icono from "../../../componentes/interfaz/Icono";
import { moneda } from "../../../utilidades/formateadores";

function formatearFechaCurso(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "long", year: "numeric" }).format(fecha);
}

export default function PaginaCursos({ datos, consultar }) {
  const cursos = useMemo(
    () =>
      datos.cursos
        .filter((curso) => curso.activo)
        .sort(
          (a, b) =>
            Number(b.destacado || false) - Number(a.destacado || false) ||
            Number(a.orden || 0) - Number(b.orden || 0),
        ),
    [datos.cursos],
  );

  return (
    <section className="seccion catalogo catalogo-cursos">
      <span className="eyebrow">FORMACIÓN QUE ABRE PUERTAS</span>
      <h1>Conocimiento en acción.</h1>
      <p>
        Explora las áreas de formación y consulta temario, próximas fechas y
        disponibilidad antes de inscribirte.
      </p>

      {!cursos.length && (
        <p className="estado-sin-datos">
          Todavía no hay cursos publicados. Consulta próximas capacitaciones por
          WhatsApp.
        </p>
      )}

      <div className="rejilla-cursos">
        {cursos.map((curso) => {
          const temas = (curso.temario || "")
            .split(";")
            .map((tema) => tema.trim())
            .filter(Boolean)
            .slice(0, 4);
          return (
            <article className="tarjeta-curso" key={curso.id}>
              <div className="visual-curso">
                <img
                  className="imagen-curso"
                  src={
                    curso.imagen ||
                    (curso.id === "curso-gps"
                      ? "/productos/gps.jpg"
                      : "/seguridad-hero.png")
                  }
                  alt={curso.nombre}
                  width="600"
                  height="800"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className="pie-imagen-curso">
                FORMACIÓN TÉCNICA · IMAGEN REFERENCIAL
              </span>

              <div className="cabecera-curso">
                <Icono nombre="GraduationCap" size={30} />
                <span>
                  {curso.cupos == null
                    ? "Consultar cupos"
                    : `Cupos: ${curso.cupos} / ${curso.capacidad}`}
                </span>
              </div>

              <h2>{curso.nombre}</h2>
              <p className="descripcion-curso">{curso.descripcion}</p>

              {temas.length > 0 && (
                <div className="temario-curso">
                  <span className="etiqueta-temario-curso">
                    CONTENIDOS PRINCIPALES
                  </span>
                  <ul>
                    {temas.map((tema) => (
                      <li key={tema}>
                        <Icono nombre="Check" size={16} />
                        <span>{tema}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(curso.duracion || curso.modalidad) && (
                <div className="metadatos-curso">
                  {curso.duracion && <span>Duración: {curso.duracion}</span>}
                  {curso.modalidad && <span>Modalidad: {curso.modalidad}</span>}
                </div>
              )}

              <div className="detalle-curso">
                <Icono nombre="CalendarDays" size={17} />
                {curso.fecha_inicio
                  ? `Próximo inicio: ${formatearFechaCurso(curso.fecha_inicio)}`
                  : "Fechas y cupos: consultar por WhatsApp"}
              </div>

              <div className="pie-curso">
                <div className="precio-curso">
                  <strong>
                    {curso.precio == null ? "Consultar precio" : moneda(curso.precio)}
                  </strong>
                  {curso.precio != null && <span>por persona</span>}
                </div>
                <button
                  className="boton primario"
                  disabled={curso.cupos === 0}
                  onClick={() =>
                    consultar(
                      `Hola CyberCorp, me interesa el curso ${curso.nombre}. ¿Podrían confirmar fechas, requisitos y cupos?`,
                      "cursos",
                    )
                  }
                >
                  {curso.cupos === 0
                    ? "Sin cupos disponibles"
                    : "Consultar por WhatsApp"}
                  <Icono nombre="MessageCircle" size={18} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="panel-ayuda-cursos">
        <div>
          <span className="eyebrow">TU SIGUIENTE PASO</span>
          <h2>Aprende a instalar. Crece con tecnología.</h2>
          <p>
            Consulta cuál curso se adapta a tus intereses. Te informaremos sobre
            fechas, requisitos y cupos antes de confirmar tu lugar.
          </p>
        </div>
        <ol>
          <li><span>01</span> Elige un curso</li>
          <li><span>02</span> Consulta los detalles</li>
          <li><span>03</span> Coordina tu inscripción</li>
        </ol>
        <button
          className="boton secundario"
          onClick={() =>
            consultar("Hola CyberCorp, quisiera información sobre los cursos disponibles.", "cursos")
          }
        >
          Consultar todos los cursos <Icono nombre="ArrowUpRight" size={17} />
        </button>
      </aside>
    </section>
  );
}
