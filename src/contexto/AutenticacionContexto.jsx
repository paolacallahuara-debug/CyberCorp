import { createContext, useContext, useEffect, useState } from "react";
import { clienteSupabase } from "../configuracion/clienteSupabase";
import { iniciarSesion, cerrarSesion, esSupabase, verificarAdministrador } from "../servicios/clienteSupabase";

const Contexto = createContext(null);
export function AutenticacionProveedor({ children }) {
  const [admin, setAdmin] = useState(false);
  const [cargando, setCargando] = useState(esSupabase);
  useEffect(() => {
    if (!esSupabase) return;
    let activo = true;
    verificarAdministrador().then((permiso) => { if (activo) setAdmin(permiso); })
      .catch(() => { if (activo) setAdmin(false); })
      .finally(() => { if (activo) setCargando(false); });
    const { data: { subscription } } = clienteSupabase?.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_OUT" && activo) setAdmin(false);
    }) || { data: { subscription: null } };
    return () => { activo = false; subscription?.unsubscribe(); };
  }, []);
  async function entrar(email, password) {
    if (esSupabase) await iniciarSesion(email, password);
    setAdmin(true);
  }
  async function salir() {
    await cerrarSesion();
    setAdmin(false);
  }
  return <Contexto.Provider value={{ admin, cargando, entrar, salir }}>{children}</Contexto.Provider>;
}
export const useAutenticacion = () => useContext(Contexto);
