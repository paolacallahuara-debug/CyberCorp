import { useMemo } from "react";
import Icono from "../../../componentes/interfaz/Icono";

function obtenerYoutubeEmbebido(url) {
  if (!url) return "";

  try {
    const enlace = new URL(url);
    let id = "";

    if (enlace.hostname.includes("youtu.be")) {
      id =
        enlace.pathname
          .split("/")
          .filter(Boolean)[0] || "";
    }

    if (enlace.hostname.includes("youtube.com")) {
      if (enlace.pathname === "/watch") {
        id = enlace.searchParams.get("v") || "";
      } else if (enlace.pathname.startsWith("/shorts/")) {
        id = enlace.pathname.split("/")[2] || "";
      } else if (enlace.pathname.startsWith("/embed/")) {
        id = enlace.pathname.split("/")[2] || "";
      }
    }

    if (!id) return "";

    return (
      `https://www.youtube.com/embed/${id}` +
      "?playsinline=1&rel=0"
    );
  } catch {
    return "";
  }
}


function obtenerTikTokEmbebido(url) {
  if (!url) return "";

  try {
    const enlace = new URL(url);

    if (!enlace.hostname.includes("tiktok.com")) {
      return "";
    }

    /*
     * URL completa habitual:
     * https://www.tiktok.com/@usuario/video/123456789
     */
    const coincidencia =
      enlace.pathname.match(/\/video\/(\d+)/);

    if (!coincidencia?.[1]) {
      return "";
    }

    const idVideo = coincidencia[1];

    return (
      `https://www.tiktok.com/player/v1/${idVideo}` +
      "?autoplay=0&controls=1&loop=0&rel=0"
    );
  } catch {
    return "";
  }
}


function obtenerFacebookEmbebido(url) {
  if (!url) return "";

  try {
    const enlace = new URL(url);

    const esFacebook =
      enlace.hostname.includes("facebook.com") ||
      enlace.hostname.includes("fb.watch");

    if (!esFacebook) {
      return "";
    }

    return (
      "https://www.facebook.com/plugins/video.php" +
      `?href=${encodeURIComponent(url)}` +
      "&show_text=false" +
      "&autoplay=false"
    );
  } catch {
    return "";
  }
}


function obtenerVideoEmbebido(url) {
  if (!url) {
    return null;
  }

  const youtube = obtenerYoutubeEmbebido(url);

  if (youtube) {
    return {
      proveedor: "youtube",
      url: youtube,
    };
  }


  const tiktok = obtenerTikTokEmbebido(url);

  if (tiktok) {
    return {
      proveedor: "tiktok",
      url: tiktok,
    };
  }


  const facebook = obtenerFacebookEmbebido(url);

  if (facebook) {
    return {
      proveedor: "facebook",
      url: facebook,
    };
  }


  return null;
}


function dominio(url) {
  try {
    return new URL(url)
      .hostname
      .replace(/^www\./, "");
  } catch {
    return "video externo";
  }
}


function ReproductorTestimonio({
  testimonio,
}) {
  /*
   * VIDEO SUBIDO DIRECTAMENTE
   * A SUPABASE STORAGE
   */
  if (
    testimonio.tipoVideo === "archivo" &&
    testimonio.videoUrl
  ) {
    return (
      <video
        className="video-testimonio video-testimonio-archivo"
        controls
        preload="metadata"
        playsInline
        src={testimonio.videoUrl}
      >
        Tu navegador no puede reproducir este video.
      </video>
    );
  }


  /*
   * URL EXTERNA
   */
  const externa =
    testimonio.videoExternoUrl;

  const videoEmbebido =
    obtenerVideoEmbebido(externa);


  if (videoEmbebido) {
    return (
      <iframe
        className={`video-testimonio video-testimonio-externo video-${videoEmbebido.proveedor}`}
        src={videoEmbebido.url}
        title={
          testimonio.titulo ||
          "Testimonio de CyberCorp"
        }
        loading="lazy"
        allow="
          autoplay;
          clipboard-write;
          encrypted-media;
          picture-in-picture;
          fullscreen
        "
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }


  /*
   * Si el proveedor no se puede incrustar,
   * dejamos enlace de respaldo.
   */
  if (externa) {
    return (
      <a
        className="enlace-video-testimonio"
        href={externa}
        target="_blank"
        rel="noreferrer noopener"
      >
        <Icono
          nombre="Play"
          size={38}
        />

        <span>
          Abrir video en {dominio(externa)}
        </span>

        <Icono
          nombre="ExternalLink"
          size={17}
        />
      </a>
    );
  }


  return (
    <div className="video-testimonio-vacio">
      <Icono
        nombre="Video"
        size={38}
      />

      <span>
        Video pendiente
      </span>
    </div>
  );
}
export default function PaginaTestimonios({ datos }) {
  const testimonios = useMemo(
    () =>
      [...datos.testimonios]
        .filter((testimonio) => testimonio.activo)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [datos.testimonios],
  );

  const publicaciones = useMemo(
    () =>
      [...datos.tiktokPublicaciones]
        .filter((publicacion) => publicacion.activo && publicacion.tiktokUrl)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [datos.tiktokPublicaciones],
  );

  return (
    <section className="seccion pagina-testimonios">
      <div className="portada-testimonios">
        <div>
          <span className="eyebrow">EXPERIENCIAS REALES</span>
          <h1>Lo cuentan quienes ya confiaron en CyberCorp.</h1>
          <p>
            Experiencias de clientes, participantes de cursos y personas que ya
            utilizaron nuestras soluciones de tecnología y seguridad.
          </p>
        </div>
        <div className="sello-testimonios" aria-hidden="true">
          <Icono nombre="MessageCircle" size={42} />
          <strong>VOCES</strong>
          <span>CYBERCORP</span>
        </div>
      </div>

      {testimonios.length ? (
        <div className="rejilla-testimonios">
          {testimonios.map((testimonio) => (
            <article className="tarjeta-testimonio" key={testimonio.id}>
              <div className="contenedor-video-testimonio">
                <ReproductorTestimonio testimonio={testimonio} />
              </div>
              <div className="contenido-testimonio">
                <span className="etiqueta-testimonio">
                  <Icono nombre="MessageCircle" size={15} /> EXPERIENCIA COMPARTIDA
                </span>
                <h2>{testimonio.titulo}</h2>
                {testimonio.nombreCliente && (
                  <strong className="cliente-testimonio">{testimonio.nombreCliente}</strong>
                )}
                {testimonio.descripcion && <p>{testimonio.descripcion}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="estado-testimonios-vacio">
          <Icono nombre="Video" size={38} />
          <h2>Próximamente compartiremos nuevas experiencias.</h2>
          <p>Los testimonios publicados desde el panel aparecerán aquí automáticamente.</p>
        </div>
      )}

      {publicaciones.length > 0 && (
        <section className="seccion-tiktok-testimonios">
          <div className="titulo-seccion">
            <div>
              <span className="eyebrow magenta">TAMBIÉN EN REDES</span>
              <h2>CyberCorp en TikTok.</h2>
            </div>
            <span className="texto-suave">Videos, trabajos y momentos de nuestros cursos.</span>
          </div>
          <div className="rejilla-tiktok-testimonios">
            {publicaciones.map((publicacion) => (
              <a
                key={publicacion.id}
                className="tarjeta-tiktok-testimonios"
                href={publicacion.tiktokUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icono nombre="Music2" size={30} />
                <div>
                  <strong>{publicacion.titulo || "Ver publicación de CyberCorp"}</strong>
                  <span>Abrir en TikTok</span>
                </div>
                <Icono nombre="ArrowUpRight" size={19} />
              </a>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
