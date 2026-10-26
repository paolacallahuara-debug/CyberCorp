import { useEffect, useMemo, useState } from "react";
import Link from "@/src/componentes/navegacion/Enlace";
import Icono from "../../../componentes/interfaz/Icono";
import ConveniosAnimados from "../../../componentes/interfaz/ConveniosAnimados";
import TextoMorfosis from "../../../componentes/interfaz/TextoMorfosis";
import TarjetaProducto from "../componentes/TarjetaProducto";
import SeccionServicios from "../componentes/SeccionServicios";
import { moneda } from "../../../utilidades/formateadores";
const slides = [
  {
    etiqueta: "SEGURIDAD ELECTRÓNICA",
    titulo: (
      <>
        Instalación de
        <br />
        Cámaras de <em>Seguridad</em>
      </>
    ),
    texto:
      "Vigila tu hogar o negocio las 24 horas. Instalamos cámaras de seguridad con acceso remoto desde tu celular para que estés tranquilo estés donde estés.",
    imagen: "/seguridad-hero.png",
    alt: "Instalación de cámaras de seguridad CyberCorp",
    mensajeWhatsApp:
      "Hola CyberCorp, quisiera cotizar la instalación de cámaras de seguridad.",
    ficha: {
      icono: "Cctv",
      titulo: "Monitoreo 24/7",
      subtitulo: "Videovigilancia remota desde tu celular",
    },
  },
  {
    etiqueta: "PROTECCIÓN PERIMETRAL",
    titulo: (
      <>
        Instalación de
        <br />
        Cercos <em>Eléctricos</em>
      </>
    ),
    texto:
      "Protege el perímetro de tu propiedad con un cerco eléctrico que disuade a los intrusos antes de que lleguen a entrar. Instalación segura y profesional.",
    imagen: "/cerco.png",
    alt: "Instalación de cercos eléctricos CyberCorp",
    mensajeWhatsApp:
      "Hola CyberCorp, quisiera cotizar la instalación de cercos eléctricos.",
    ficha: {
      icono: "Zap",
      titulo: "Disuasión perimetral",
      subtitulo: "Protección perimetral de alta seguridad",
    },
  },
  {
    etiqueta: "SISTEMAS DE ALERTA",
    titulo: (
      <>
        Instalación de
        <br />
        <em>Alarmas</em>
      </>
    ),
    texto:
      "Alarmas para casas, autos y motos con sensores de movimiento y de apertura de puertas. Una alerta inmediata ante cualquier intento de ingreso.",
    imagen: "/alarmas.png",
    alt: "Instalación de alarmas CyberCorp",
    mensajeWhatsApp:
      "Hola CyberCorp, quisiera cotizar la instalación de alarmas.",
    ficha: {
      icono: "ShieldCheck",
      titulo: "Alerta inmediata",
      subtitulo: "Sensores para casas, autos y motos",
    },
  },
];
export default function PaginaInicio({ datos, consultar }) {
  const [slide, setSlide] = useState(0);
  const [slideAnterior, setSlideAnterior] = useState(0);

  const irASlide = (nuevoIndice) => {
    setSlide((actual) => {
      setSlideAnterior(actual);
      return nuevoIndice;
    });
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlide((actual) => {
        setSlideAnterior(actual);
        return (actual + 1) % slides.length;
      });
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);
  const s = slides[slide];

  const categoriasInicio = useMemo(() => {
    const categoriasConProductos = new Set(
      datos.productos
        .filter((producto) => producto.activo)
        .map((producto) => producto.categoria)
        .filter(Boolean),
    );
    const ordenadas = (datos.categorias || [])
      .filter((categoria) => categoria.activo !== false && categoriasConProductos.has(categoria.nombre))
      .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
      .map((categoria) => categoria.nombre);
    const faltantes = [...categoriasConProductos].filter((nombre) => !ordenadas.includes(nombre));
    return [...ordenadas, ...faltantes].slice(0, 6);
  }, [datos.categorias, datos.productos]);

  const ofertasVigentes = useMemo(() => {
    const ahora = new Date();
    return datos.ofertas.filter(
      (oferta) =>
        oferta.activo &&
        (!oferta.fecha_inicio || new Date(oferta.fecha_inicio) <= ahora) &&
        (!oferta.fecha_fin || new Date(oferta.fecha_fin) >= ahora),
    );
  }, [datos.ofertas]);

  const productosDestacados = useMemo(
    () =>
      datos.productos
        .filter((producto) => producto.activo)
        .sort(
          (a, b) =>
            Number(b.destacado || false) - Number(a.destacado || false),
        )
        .slice(0, 4),
    [datos.productos],
  );

  const conveniosDestacados = useMemo(() => {
    const listaConvenios = Array.isArray(datos?.convenios)
      ? datos.convenios
      : [];

    return [...listaConvenios]
      .filter((convenio) => convenio.activo)
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at || 0) -
          new Date(a.updated_at || a.created_at || 0),
      );
  }, [datos?.convenios]);

  return (
    <>
      <section className="hero">
        <div className="hero-galeria" aria-hidden="true">
          {slides.map((diapositiva, i) => {
            const esActivo = i === slide;
            const esAnterior = i === slideAnterior;
            const clase = esActivo ? "activo" : esAnterior ? "anterior" : "";
            return (
              <img
                key={diapositiva.imagen}
                src={diapositiva.imagen}
                className={`hero-imagen ${clase}`}
                alt={diapositiva.alt}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            );
          })}
        </div>
        <div className="hero-sombra" />
        <div className="hero-contenido" >
          <span className="etiqueta">
            <i /> {s.etiqueta}
          </span>

          <TextoMorfosis
            frases={slides.map((diapositiva) => diapositiva.titulo)}
            indiceActivo={slide}
          />

          <div className="hero-cuerpo-contenedor">
            {slides.map((diapositiva, i) => {
              const activa = i === slide;
              return (
                <div
                  key={i}
                  className={`hero-slide-cuerpo ${activa ? "activo" : ""}`}
                  aria-hidden={!activa}
                >
                  <p>{diapositiva.texto}</p>
                  <div className="hero-botones">
                    <a
                      className="boton primario"
                      href={`https://wa.me/59167370323?text=${encodeURIComponent(diapositiva.mensajeWhatsApp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Consultar por WhatsApp sobre ${diapositiva.etiqueta}`}
                      tabIndex={activa ? 0 : -1}
                    >
                      Consultar
                      <Icono nombre="MessageCircle" size={18} />
                    </a>
                    <Link
                      className="boton secundario"
                      href="/servicios"
                      tabIndex={activa ? 0 : -1}
                    >
                      Nuestros servicios
                      <Icono nombre="ArrowUpRight" size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hero-nota">
            <Icono nombre="ShieldCheck" size={17} /> Tecnología confiable.
            Asesoría especializada.
          </div>
        </div>
        <div className="hero-pie">
          <div className="puntos">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Ver diapositiva ${i + 1}`}
                aria-pressed={slide === i}
                className={slide === i ? "seleccionado" : ""}
                onClick={() => irASlide(i)}
              />
            ))}
          </div>
          <span>
            0{slide + 1} <small>/ 03</small>
          </span>
          <div className="flechas">
            <button
              aria-label="Anterior"
              onClick={() => irASlide((slide + 2) % 3)}
            >
              <Icono nombre="ChevronLeft" />
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => irASlide((slide + 1) % 3)}
            >
              <Icono nombre="ChevronRight" />
            </button>
          </div>
        </div>
        <div className="hero-ficha">
          <Icono nombre={s.ficha?.icono || "Cctv"} />
          <div>
            <strong>{s.ficha?.titulo || "Siempre un paso adelante."}</strong>
            <span>{s.ficha?.subtitulo || "Videovigilancia inteligente 24/7"}</span>
          </div>
        </div>
      </section>
      <div className="confianza">
        {[
          ["ShieldCheck", "Equipos confiables", "Tecnología seleccionada"],
          ["Wrench", "Instalación profesional", "Soluciones a tu medida"],
          ["Headphones", "Asesoría personalizada", "Te ayudamos a elegir"],
          ["MapPin", "Estamos en Tarija", "Atención cercana y directa"],
        ].map(([i, n, d]) => (
          <div key={n}>
            <Icono nombre={i} size={27} />
            <span>
              <strong>{n}</strong>
              <small>{d}</small>
            </span>
          </div>
        ))}
      </div>
      <section className="seccion categorias">
        <div className="titulo-seccion">
          <div>
            <span className="eyebrow">ENCUENTRA LO QUE NECESITAS</span>
            <h2>Un mundo de posibilidades.</h2>
          </div>
          <Link className="enlace" href="/productos">
            Ver catálogo <Icono nombre="ArrowUpRight" size={17} />
          </Link>
        </div>
        <div className="rejilla-categorias-inicio">
          {categoriasInicio.map((nombre) => {
            const productoCategoria = datos.productos.find(
              (producto) => producto.activo && producto.categoria === nombre,
            );
            return (
              <Link
                className="tarjeta-categoria-inicio"
                key={nombre}
                href={`/productos?categoria=${encodeURIComponent(nombre)}`}
              >
                <Icono nombre={productoCategoria?.icono || "Package"} size={31} />
                <span>{nombre}</span>
                <Icono nombre="ArrowUpRight" size={16} />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="seccion">
        <div className="titulo-seccion">
          <div>
            <span className="eyebrow magenta">
              MÁS TECNOLOGÍA. MEJOR PRECIO.
            </span>
            <h2>Ofertas que te protegen.</h2>
          </div>
          <span className="texto-suave">Paquetes pensados para ti</span>
        </div>
        <div className="rejilla-ofertas">
          {ofertasVigentes.map((oferta, indice) => (
            <article className="tarjeta-oferta" key={oferta.id}>
              <div className="visual-oferta">
                {oferta.imagen ? (
                  <img
                    className="imagen-oferta"
                    src={oferta.imagen}
                    alt={oferta.nombre}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="marcador-oferta">
                    <Icono
                      nombre={indice % 2 ? "MapPin" : "Cctv"}
                      size={82}
                      strokeWidth={1}
                    />
                  </div>
                )}
                {oferta.descuento > 0 && (
                  <span className="descuento-oferta">{oferta.descuento}% OFF</span>
                )}
              </div>
              <div className="contenido-oferta">
                <h3>{oferta.nombre}</h3>
                <p>{oferta.descripcion}</p>
                <div className="precio-oferta">
                  <strong>{moneda(oferta.precio)}</strong>
                  {oferta.anterior != null && oferta.anterior > oferta.precio && (
                    <del>{moneda(oferta.anterior)}</del>
                  )}
                </div>
                <button
                  className="enlace"
                  onClick={() =>
                    consultar(
                      `Hola CyberCorp, me interesa la oferta ${oferta.nombre} por ${moneda(oferta.precio)}`,
                    )
                  }
                >
                  Quiero esta oferta <Icono nombre="ArrowRight" size={18} />
                </button>
              </div>
            </article>
          ))}
          {!ofertasVigentes.length && (
            <p className="estado-sin-datos">
              Todavía no hay promociones vigentes.
            </p>
          )}
        </div>
      </section>
      <section className="seccion">
        <div className="titulo-seccion">
          <div>
            <span className="eyebrow">EQUIPA TU DÍA A DÍA</span>
            <h2>Tecnología destacada.</h2>
          </div>
          <Link className="enlace" href="/productos">
            Ver todos los productos <Icono nombre="ArrowUpRight" size={17} />
          </Link>
        </div>
        <div className="rejilla-productos">
          {productosDestacados.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      </section>
      <SeccionServicios datos={datos} consultar={consultar} />

      {conveniosDestacados?.length > 0 && (
        <section className="seccion seccion-beneficios-inicio">
          <div className="titulo-seccion">
            <div>
              <span className="eyebrow magenta">MÁS QUE TECNOLOGÍA</span>
              <h2>Beneficios y convenios para nuestra comunidad.</h2>
            </div>
            <Link className="enlace" href="/nosotros">
              Ver todos los convenios <Icono nombre="ArrowUpRight" size={17} />
            </Link>
          </div>
          <ConveniosAnimados
            convenios={conveniosDestacados || []}
            reproduccionAutomatica
            intervalo={5000}
          />
        </section>
      )}

      <section className="curso-banner">
        <div>
          <span className="eyebrow">INVIERTE EN LO QUE SABES</span>
          <h2>
            Aprende hoy.
            <br />
            Instala el futuro.
          </h2>
          <p>Cursos técnicos con práctica real y acompañamiento.</p>
          <Link href="/cursos" className="boton primario">
            Explorar cursos <Icono nombre="ArrowUpRight" size={18} />
          </Link>
        </div>
        <Icono nombre="GraduationCap" size={140} strokeWidth={1} />
        <span className="curso-grande">
          NEXT
          <br />
          LEVEL_
        </span>
      </section>
    </>
  );
}
