import { Routes, Route, Navigate } from "react-router-dom";
import DisenoPrincipal from "../estructura/DisenoPrincipal";
import { usarDatos } from "../contexto/DatosContexto";
import PaginaInicio from "../funcionalidades/cliente/paginas/PaginaInicio";
import PaginaProductos from "../funcionalidades/cliente/paginas/PaginaProductos";
import PaginaCursos from "../funcionalidades/cliente/paginas/PaginaCursos";
import PaginaSobreNosotros from "../funcionalidades/cliente/paginas/PaginaSobreNosotros";
import PaginaServicios from "../funcionalidades/cliente/paginas/PaginaServicios";
import PaginaTestimonios from "../funcionalidades/cliente/paginas/PaginaTestimonios";
import PaginaDashboardAdmin from "../funcionalidades/administrador/paginas/PaginaDashboardAdmin";
import DisenoAdministrador from "../estructura/DisenoAdministrador";
import PaginaAcceso from "../funcionalidades/administrador/paginas/PaginaAcceso";
import Enlace from "../componentes/navegacion/Enlace";
function Pagina({ Componente }) {
  const estado = usarDatos();
  // El inicio contiene contenido independiente de la base (hero y carrusel).
  // Mostrarlo incluso si el catálogo aún no tiene permisos de lectura.
  const datos = estado.datos || (Componente === PaginaInicio && estado.error
    ? {
        productos: [], cursos: [], ofertas: [], servicios: [], categorias: [], marcas: [],
        convenios: [], testimonios: [], tiktokPublicaciones: [],
        configuracion: { whatsapp: "59167370323", whatsappCursos: "59163777341", whatsappServicios: "59167370323" },
      }
    : null);
  return <Componente {...estado} datos={datos} />;
}
export default function RutasAplicacion() {
  return (
    <Routes>
      <Route element={<DisenoPrincipal />}>
        <Route index element={<Pagina Componente={PaginaInicio} />} />
        <Route
          path="productos"
          element={<Pagina Componente={PaginaProductos} />}
        />
        <Route path="cursos" element={<Pagina Componente={PaginaCursos} />} />
        <Route
          path="servicios"
          element={<Pagina Componente={PaginaServicios} />}
        />
        <Route
          path="testimonios"
          element={<Pagina Componente={PaginaTestimonios} />}
        />
        <Route
          path="nosotros"
          element={<Pagina Componente={PaginaSobreNosotros} />}
        />
        <Route path="acceso" element={<PaginaAcceso />} />
        <Route path="registro" element={<Navigate to="/acceso" replace />} />
        <Route
          path="*"
          element={
            <section className="vacio">
              <h1>Página no encontrada</h1>
              <Enlace href="/" className="boton primario">
                Volver al inicio
              </Enlace>
            </section>
          }
        />
      </Route>
      <Route path="administrador" element={<DisenoAdministrador />}>
        <Route index element={<Pagina Componente={PaginaDashboardAdmin} />} />
      </Route>
    </Routes>
  );
}
