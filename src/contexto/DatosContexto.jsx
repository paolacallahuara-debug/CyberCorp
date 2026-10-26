import { createContext, useContext } from "react";
import { toast } from "sonner";
import { useServicioSupabase } from "../ganchos/useServicioSupabase";
import { enlaceWhatsApp } from "../funcionalidades/carrito/utilidades/formateadorWhatsApp";

const Contexto = createContext(null);

export function DatosProveedor({ children }) {
  const estado = useServicioSupabase();

  function consultar(mensaje, canal = "general") {
    if (estado.error) return toast.error(estado.error);
    try {
      const configuracion = estado.datos?.configuracion || {};
      let numero =
        canal === "cursos"
          ? (configuracion.whatsappCursos || "59163777341")
          : canal === "servicios"
            ? (configuracion.whatsappServicios || "59167370323")
            : (configuracion.whatsapp || "59167370323");

      if (canal === "cursos" && String(numero).includes("75123977")) {
        numero = "59163777341";
      } else if (String(numero).includes("75123977") || String(numero).includes("75149155")) {
        numero = "59167370323";
      }

      window.open(
        enlaceWhatsApp(numero, mensaje),
        "_blank",
        "noopener,noreferrer",
      );
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <Contexto.Provider value={{ ...estado, consultar }}>
      {children}
    </Contexto.Provider>
  );
}

export const usarDatos = () => useContext(Contexto);
