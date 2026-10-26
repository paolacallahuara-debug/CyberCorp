import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Enlace from "../../../componentes/navegacion/Enlace";
import Icono from "../../../componentes/interfaz/Icono";
import { useAutenticacion } from "../../../contexto/AutenticacionContexto";
import { esSupabase } from "../../../servicios/clienteSupabase";

export default function PaginaAcceso() {
  const [ocupado, setOcupado] = useState(false);
  const { entrar } = useAutenticacion();
  const navegar = useNavigate();

  async function enviar(evento) {
    evento.preventDefault();
    const campos = new FormData(evento.currentTarget);
    setOcupado(true);
    try {
      await entrar(campos.get("correo"), campos.get("clave"));
      navegar("/administrador", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="acceso-pagina">
      <div className="acceso-presentacion">
        <span className="etiqueta">CYBERCORP / ACCESO</span>
        <h1>Tu centro de <em>control.</em></h1>
        <p>Gestiona productos, cursos y ofertas desde un solo lugar.</p>
        <div className="acceso-icono"><Icono nombre="ScanFace" size={120} strokeWidth={1} /></div>
        <small>Tarija · Tecnología y seguridad avanzada</small>
      </div>
      <div className="acceso-formulario">
        <h2>Acceso de Administrador</h2>
        <p>
          {esSupabase
            ? "Ingresa con una cuenta de administrador autorizada en Supabase."
            : "Acceso de demostración: por ahora cualquier formulario te lleva al panel. No se guardan cuentas ni contraseñas."}
        </p>
        <form onSubmit={enviar}>
          <label>
            Correo electrónico
            <input
              name="correo"
              type="email"
              autoComplete="email"
              required
              placeholder="nombre@ejemplo.com"
            />
          </label>
          <label>
            Contraseña
            <input
              name="clave"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <button className="boton primario" type="submit" disabled={ocupado}>
            {ocupado ? "Ingresando…" : "Iniciar sesión"}
            <Icono nombre="ArrowUpRight" size={19} />
          </button>
        </form>
        <Enlace href="/" className="acceso-volver">← Volver al sitio</Enlace>
      </div>
    </section>
  );
}
