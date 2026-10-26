import { Navigate } from "react-router-dom";
import { useAutenticacion } from "../contexto/AutenticacionContexto";
export default function RutasProtegidasAdmin({ children }) {
  const { admin, cargando } = useAutenticacion();
  if (cargando) return <div className="vacio" role="status">Verificando acceso…</div>;
  return admin ? children : <Navigate to="/acceso" replace />;
}
