import { useEffect } from "react";
/** Solo oculta elementos fuera de pantalla una vez listo el observador. */
export function useAparicionScroll(dependencia, ruta) {
  useEffect(() => {
    if (!dependencia || !("IntersectionObserver" in window)) return;
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preferencia.matches) return;
    const elementos = [
      ...document.querySelectorAll(
        "main .titulo-seccion, main .tarjeta-categoria-inicio, main .tarjeta-producto, main .tarjeta-oferta, main .tarjeta-servicio, main .curso-banner, main .tarjeta-curso, main .nosotros-bloque, main .nosotros-cotizacion, main .tarjeta-beneficio-inicio, main .tarjeta-convenio-nosotros, main .tarjeta-testimonio, main .tarjeta-tiktok-testimonios",
      ),
    ];
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("revelado");
            observador.unobserve(entrada.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -25px 0px" },
    );
    elementos.forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight - 35) return;
      el.classList.add("revelar");
      el.style.setProperty("--retardo", `${(i % 4) * 75}ms`);
      observador.observe(el);
    });
    const mostrar = () => {
      if (preferencia.matches)
        elementos.forEach((el) => el.classList.add("revelado"));
    };
    preferencia.addEventListener("change", mostrar);
    return () => {
      observador.disconnect();
      preferencia.removeEventListener("change", mostrar);
      elementos.forEach((el) => el.classList.remove("revelar", "revelado"));
    };
  }, [dependencia, ruta]);
}
