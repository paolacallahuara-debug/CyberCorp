import { Outlet } from "react-router-dom";
import EncabezadoAdministrador from "./EncabezadoAdministrador";
import RutasProtegidasAdmin from "../rutas/RutasProtegidasAdmin";
import { usarDatos } from "../contexto/DatosContexto";
import { Toaster } from "sonner";
export default function DisenoAdministrador() {
  const { datos, error } = usarDatos();
  return <RutasProtegidasAdmin>
    <div className="estructura-administrador">
      <EncabezadoAdministrador />
      <main className="admin-main">
        {error ? <div className="vacio" role="alert">No se pudo leer el catálogo: {error}</div>
          : datos ? <Outlet /> : <div className="vacio" role="status">Cargando panel…</div>}
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  </RutasProtegidasAdmin>;
}
