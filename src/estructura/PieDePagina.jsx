import Link from "../componentes/navegacion/Enlace";
import Icono from "../componentes/interfaz/Icono";
import { usarDatos } from "../contexto/DatosContexto";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa6";

export default function PieDePagina() {
  const { consultar, datos } = usarDatos();
  const configuracion = datos?.configuracion || {};

  const redes = [
    { nombre: "Facebook", IconoRed: FaFacebookF, url: configuracion.facebook },
    { nombre: "Instagram", IconoRed: FaInstagram, url: configuracion.instagram },
    { nombre: "TikTok", IconoRed: FaTiktok, url: configuracion.tiktok },
  ].filter((red) => red.url);

  const numProductos = (() => {
    const n = String(configuracion.whatsapp || "59167370323").replace(/\D/g, "");
    return n.includes("75123977") || !n ? "59167370323" : n;
  })();

  const numCursos = (() => {
    const n = String(configuracion.whatsappCursos || "59163777341").replace(/\D/g, "");
    return n.includes("75123977") || !n ? "59163777341" : n;
  })();

  const numServicios = (() => {
    const n = String(configuracion.whatsappServicios || configuracion.whatsapp || "59167370323").replace(/\D/g, "");
    return n.includes("75149155") || n.includes("75123977") || !n ? "59167370323" : n;
  })();

  return (
    <footer className="pie-pagina-principal">
      <div className="footer-top footer-redisenado">

        {/* ── Identidad ── */}
        <div className="footer-identidad">
          <div className="footer-identidad-superior">
            <Link href="/" className="logo-empresa footer-logo" aria-label="CyberCorp · Inicio">
              {/* Modo oscuro: logo sin fondo */}
              <img
                className="logo-tema logo-oscuro"
                src="/marca/logo-sinfondo.png"
                alt="CyberCorp"
                width="200"
                height="80"
                decoding="async"
                draggable="false"
              />
              {/* Modo claro */}
              <img
                className="logo-tema logo-claro"
                src="/marca/logo-claro.png"
                alt="CyberCorp"
                width="200"
                height="80"
                decoding="async"
                draggable="false"
              />
            </Link>

            <p className="footer-eslogan">
              {configuracion.eslogan || "Sistemas de Seguridad y Tecnología Avanzada"}
            </p>
          </div>

          <div className="redes-footer">
            {redes.map(({ nombre, IconoRed, url }) => (
              <a
                key={nombre}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Abrir ${nombre} de CyberCorp`}
              >
                <IconoRed size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Explora ── */}
        <div className="footer-columna footer-explora">
          <span>Explora</span>
          <Link href="/productos">Productos</Link>
          <Link href="/cursos">Cursos técnicos</Link>
          <Link href="/servicios">Servicios profesionales</Link>
          <Link href="/testimonios">Testimonios</Link>
          <Link href="/nosotros">Sobre nosotros</Link>
        </div>

        {/* ── Contactos por área ── */}
        <div className="footer-columna footer-contactos">
          <span>Contactos por área</span>

          <button
            type="button"
            onClick={() =>
              consultar("Hola CyberCorp, quisiera información sobre productos.", "general")
            }
          >
            <Icono nombre="MessageCircle" size={17} />
            <span>
              <strong>Productos</strong>
              <small>+{numProductos}</small>
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              consultar(
                "Hola CyberCorp, quisiera información sobre los cursos disponibles.",
                "cursos",
              )
            }
          >
            <Icono nombre="GraduationCap" size={17} />
            <span>
              <strong>Cursos</strong>
              <small>+{numCursos}</small>
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              consultar(
                "Hola CyberCorp, quisiera información sobre servicios e instalaciones.",
                "servicios",
              )
            }
          >
            <Icono nombre="Wrench" size={17} />
            <span>
              <strong>Servicios</strong>
              <small>+{numServicios}</small>
            </span>
          </button>
        </div>

        {/* ── Visítanos ── */}
        <div className="footer-columna footer-ubicacion">
          <span>Visítanos</span>

          <div className="dato-footer">
            <Icono nombre="MapPinned" size={19} />
            <p>{configuracion.direccion || "Tarija, Bolivia"}</p>
          </div>

          {configuracion.ubicacionUrl && (
            <a
              className="enlace-ubicacion-footer"
              href={configuracion.ubicacionUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Ver ubicación <Icono nombre="ArrowUpRight" size={16} />
            </a>
          )}

          {configuracion.horarios && (
            <div className="dato-footer">
              <Icono nombre="Clock3" size={19} />
              <p className="horarios-footer">{configuracion.horarios}</p>
            </div>
          )}

          {configuracion.telefono && (
            <div className="dato-footer dato-footer-secundario">
              <Icono nombre="Phone" size={18} />
              <p>{configuracion.telefono}</p>
            </div>
          )}

          {configuracion.email && (
            <div className="dato-footer dato-footer-secundario">
              <Icono nombre="Mail" size={18} />
              <p>{configuracion.email}</p>
            </div>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CyberCorp. Tecnología con propósito.</span>
        <Link href="/acceso">Acceso administrador ↗</Link>
      </div>
    </footer>
  );
}
