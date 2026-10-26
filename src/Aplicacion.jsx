import { BrowserRouter } from "react-router-dom";
import { TemaProveedor } from "./contexto/TemaContexto";
import { CarritoProveedor } from "./contexto/CarritoContexto";
import { AutenticacionProveedor } from "./contexto/AutenticacionContexto";
import { DatosProveedor } from "./contexto/DatosContexto";
import RutasAplicacion from "./rutas/RutasAplicacion";
export default function Aplicacion() {
  return (
    <BrowserRouter>
      <TemaProveedor>
        <AutenticacionProveedor>
          <CarritoProveedor>
            <DatosProveedor>
              <RutasAplicacion />
            </DatosProveedor>
          </CarritoProveedor>
        </AutenticacionProveedor>
      </TemaProveedor>
    </BrowserRouter>
  );
}
