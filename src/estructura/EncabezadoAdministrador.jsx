import { useNavigate } from "react-router-dom";
import Enlace from "../componentes/navegacion/Enlace";
import Icono from "../componentes/interfaz/Icono";
import LogoEmpresa from "./LogoEmpresa";
import { useAutenticacion } from "../contexto/AutenticacionContexto";
export default function EncabezadoAdministrador() {
  const { salir } = useAutenticacion();
  const navegar = useNavigate();
  return <header className="cabecera-administrador">
    <LogoEmpresa />
    <div><span className="eyebrow">CYBERCORP / PANEL INTERNO</span><strong>Administración</strong></div>
    <nav aria-label="Navegación del administrador">
      <Enlace href="/" className="boton secundario"><Icono nombre="ExternalLink" size={17} /> Ver tienda</Enlace>
      <button className="boton secundario" onClick={async () => { await salir(); navegar("/acceso", { replace: true }); }}><Icono nombre="LogOut" size={17} /> Salir</button>
    </nav>
  </header>;
}
