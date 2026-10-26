import { useMemo } from "react";
import Icono from "../../../componentes/interfaz/Icono";
import Link from "../../../componentes/navegacion/Enlace";

export default function PaginaSobreNosotros({ datos, consultar }) {
  const convenios = useMemo(
    () =>
      [...(datos.convenios || [])]
        .filter((convenio) => convenio.activo)
        .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)),
    [datos.convenios],
  );

  return (
    <section className="nosotros">
      <div className="nosotros-portada">
        <span className="eyebrow">CYBERCORP · TARIJA, BOLIVIA</span>
        <h1>
          Aprendemos. Conectamos.
          <br />
          <em>Protegemos lo que importa.</em>
        </h1>
        <p>
          Somos una empresa de seguridad y tecnología que reúne productos,
          formación técnica e instalación profesional en un solo lugar. Te
          acompañamos para elegir, aprender y poner en marcha la solución que
          necesitas.
        </p>
      </div>

      <div className="nosotros-bloques">
        <article className="nosotros-bloque">
          <Icono nombre="GraduationCap" size={34} />
          <span className="eyebrow">01 / FORMACIÓN TÉCNICA</span>
          <h2>Conocimiento que se pone en práctica.</h2>
          <p>
            Ofrecemos cursos técnicos y capacitaciones orientadas a la práctica
            para que cada participante pueda desarrollar nuevas habilidades y
            aplicarlas en proyectos reales.
          </p>
          <Link href="/cursos" className="enlace">
            Conocer los cursos <Icono nombre="ArrowUpRight" />
          </Link>
        </article>

        <article className="nosotros-bloque">
          <Icono nombre="Monitor" size={34} />
          <span className="eyebrow">02 / PRODUCTOS Y COMPONENTES</span>
          <h2>Tecnología para cada proyecto.</h2>
          <p>
            Reunimos soluciones de seguridad, informática, conectividad y hogar
            inteligente para clientes que buscan equipos acompañados de asesoría.
          </p>
          <Link href="/productos" className="enlace">
            Explorar productos <Icono nombre="ArrowUpRight" />
          </Link>
        </article>

        <article className="nosotros-bloque">
          <Icono nombre="MapPin" size={34} />
          <span className="eyebrow">03 / INSTALACIÓN PROFESIONAL</span>
          <h2>Protección en casa y en movimiento.</h2>
          <p>
            Instalamos GPS, cámaras de seguridad, cercas eléctricas, alarmas y
            otras soluciones para viviendas, negocios y vehículos.
          </p>
          <Link href="/servicios" className="enlace">
            Ver nuestros servicios <Icono nombre="ArrowUpRight" />
          </Link>
        </article>

        <article className="nosotros-bloque">
          <Icono nombre="Wrench" size={34} />
          <span className="eyebrow">04 / SOPORTE Y MANTENIMIENTO</span>
          <h2>Más vida para tus equipos.</h2>
          <p>
            Brindamos soporte técnico y mantenimiento de equipos tecnológicos.
            Analizamos cada necesidad para orientar la atención adecuada.
          </p>
          <button
            className="enlace"
            onClick={() =>
              consultar(
                "Hola CyberCorp, necesito soporte técnico o mantenimiento para mi equipo. ¿Podrían orientarme?",
                "servicios",
              )
            }
          >
            Consultar soporte <Icono nombre="ArrowUpRight" />
          </button>
        </article>
      </div>

      {convenios.length > 0 && (
        <section className="seccion-convenios-nosotros">
          <div className="titulo-seccion">
            <div>
              <span className="eyebrow">ALIANZAS QUE SUMAN</span>
              <h2>Cooperativas, empresas e instituciones que trabajan con nosotros.</h2>
            </div>
            <span className="texto-suave">
              Convenios y beneficios que amplían las oportunidades para clientes y participantes.
            </span>
          </div>

          <div className="rejilla-convenios-nosotros">
            {convenios.map((convenio) => (
              <article className="tarjeta-convenio-nosotros" key={convenio.id}>
                <div className="visual-convenio-nosotros">
                  {convenio.imagen ? (
                    <img src={convenio.imagen} alt={convenio.titulo} loading="lazy" decoding="async" />
                  ) : (
                    <Icono nombre="Handshake" size={48} />
                  )}
                </div>
                <div className="contenido-convenio-nosotros">
                  <span className="etiqueta-convenio">CONVENIO CYBERCORP</span>
                  <h3>{convenio.titulo}</h3>
                  {convenio.descripcion && <p>{convenio.descripcion}</p>}
                  {convenio.enlace && (
                    <a href={convenio.enlace} target="_blank" rel="noreferrer noopener" className="enlace">
                      Conocer más <Icono nombre="ArrowUpRight" size={17} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="nosotros-cotizacion">
        <div>
          <span className="eyebrow">HABLEMOS DE TU PROYECTO</span>
          <h2>Una cotización a tu medida.</h2>
          <p>
            Consulta instalaciones y asistencia profesional. Cuéntanos qué
            espacio, vehículo o equipo necesitas atender y te orientaremos.
          </p>
        </div>
        <button
          className="boton primario"
          onClick={() =>
            consultar(
              "Hola CyberCorp, quisiera una cotización de instalación o servicio. Mi proyecto es: ",
              "servicios",
            )
          }
        >
          <Icono nombre="MessageCircle" /> Solicitar cotización
        </button>
      </div>
    </section>
  );
}
