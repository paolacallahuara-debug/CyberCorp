import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import Encabezado from "./Encabezado";
import PieDePagina from "./PieDePagina";
import DrawerCarrito from "../funcionalidades/carrito/componentes/DrawerCarrito";
import { usarDatos } from "../contexto/DatosContexto";
import { useAparicionScroll } from "../ganchos/useAparicionScroll";
import Enlace from "../componentes/navegacion/Enlace";
import "./estructura.css";
export default function DisenoPrincipal() {
  const { pathname, search } = useLocation();
  const { datos, error, consultar } = usarDatos();
  const paginaAcceso = pathname === "/acceso" || pathname === "/registro";
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search]);
  useAparicionScroll(datos, pathname + search);
  return (
    <>
      <Encabezado pagina={pathname} />
      <main id="contenido-principal">
        {paginaAcceso ? (
          <div key={pathname} className="pagina-entrada">
            <Outlet />
          </div>
        ) : error && pathname === "/" ? (
          <>
            <div className="vacio" role="alert">
              <p>No se pudo cargar el catálogo: {error}</p>
              <button onClick={() => location.reload()} className="boton primario">Reintentar</button>
            </div>
            <div key={pathname} className="pagina-entrada"><Outlet /></div>
          </>
        ) : error ? (
          <div className="vacio">
            <h1>No se pudo cargar el catálogo</h1>
            <p>{error}</p>
            <button
              onClick={() => location.reload()}
              className="boton primario"
            >
              Reintentar
            </button>
            <p><Enlace href="/acceso">Ir al inicio de sesión</Enlace></p>
          </div>
        ) : !datos ? (
          <div className="vacio" role="status">
            Cargando catálogo…
          </div>
        ) : (
          <div key={pathname} className="pagina-entrada">
            <Outlet />
          </div>
        )}
      </main>
      <PieDePagina />
      {datos && <DrawerCarrito datos={datos} consultar={consultar} />}
      <Toaster richColors position="bottom-right" />
    </>
  );
}
