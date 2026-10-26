import { useCallback, useEffect, useState } from "react";
import { servicioDatos } from "../servicios/clienteSupabase";
import { validarDatos } from "../funcionalidades/migracion/migradorBD";
import { useAutenticacion } from "../contexto/AutenticacionContexto";

export function useServicioSupabase() {
  const { admin, cargando } = useAutenticacion();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  const refrescar = useCallback(async () => {
    const resultado = validarDatos(await servicioDatos.leer());
    setDatos(resultado);
    setError("");
    return resultado;
  }, []);

  useEffect(() => {
    if (cargando) return;
    let vivo = true;
    servicioDatos
      .leer()
      .then((r) => {
        if (vivo) {
          setDatos(validarDatos(r));
          setError("");
        }
      })
      .catch((e) => {
        if (vivo) setError(e.message);
      });
    return () => {
      vivo = false;
    };
  }, [admin, cargando]);

  async function guardarEntidad(tipo, entrada, anterior) {
    const nuevo = validarDatos(
      await servicioDatos.guardarEntidad(tipo, entrada, anterior),
    );
    setDatos(nuevo);
  }

  async function eliminarEntidad(tipo, id) {
    const nuevo = validarDatos(await servicioDatos.eliminarEntidad(tipo, id));
    setDatos(nuevo);
  }

  async function guardarConfiguracion(cambios) {
    const nuevo = validarDatos(
      await servicioDatos.guardarConfiguracion(datos, cambios),
    );
    setDatos(nuevo);
  }

  async function guardarCatalogo(tipo, entrada, anterior) {
    const nuevo = validarDatos(
      await servicioDatos.guardarCatalogo(tipo, entrada, anterior),
    );
    setDatos(nuevo);
  }

  async function eliminarCatalogo(tipo, id) {
    const nuevo = validarDatos(await servicioDatos.eliminarCatalogo(tipo, id));
    setDatos(nuevo);
  }

  return {
    datos,
    error,
    guardarEntidad,
    eliminarEntidad,
    guardarConfiguracion,
    guardarCatalogo,
    eliminarCatalogo,
    refrescar,
  };
}
