import { useState } from "react";
import { toast } from "sonner";
import CampoCorregido from "../../../componentes/interfaz/CampoCorregido.jsx";

export default function GestionCatalogos({
  datos,
  guardarCatalogo,
  eliminarCatalogo,
}) {
  const [tipo, setTipo] = useState("categorias");
  const [editar, setEditar] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function ejecutar(funcion) {
    setOcupado(true);
    try {
      await funcion();
      toast.success("Catálogo actualizado");
      setEditar(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="caja-administracion catalogos-administracion">
      <h2>Categorías y marcas</h2>
      <p>Se usan para clasificar los productos de la tienda.</p>

      <div className="selector-administracion">
        <button
          className={tipo === "categorias" ? "boton primario" : "boton secundario"}
          onClick={() => {
            setTipo("categorias");
            setEditar(null);
          }}
        >
          Categorías
        </button>
        <button
          className={tipo === "marcas" ? "boton primario" : "boton secundario"}
          onClick={() => {
            setTipo("marcas");
            setEditar(null);
          }}
        >
          Marcas
        </button>
      </div>

      <ul className="lista-catalogos-administracion">
        {datos[tipo].map((elemento) => (
          <li key={elemento.id}>
            <span>
              {elemento.nombre}
              <small>{elemento.activo ? "Activo" : "Oculto"}</small>
            </span>
            <div>
              <button
                className="iconobtn"
                aria-label={`Editar ${elemento.nombre}`}
                onClick={() => setEditar(elemento)}
              >
                Editar
              </button>
              <button
                className="iconobtn"
                aria-label={`Eliminar ${elemento.nombre}`}
                onClick={() => {
                  if (
                    window.confirm(
                      `¿Eliminar ${elemento.nombre}? Los productos asociados quedarán sin ${tipo === "categorias" ? "categoría" : "marca"}.`,
                    )
                  ) {
                    ejecutar(() => eliminarCatalogo(tipo, elemento.id));
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!editar && (
        <button
          className="boton secundario"
          onClick={() => setEditar({ activo: true })}
        >
          Agregar {tipo === "categorias" ? "categoría" : "marca"}
        </button>
      )}

      {editar && (
        <form
          className="formulario-catalogo-administracion"
          key={`${tipo}-${editar.id || "nuevo"}`}
          onSubmit={(evento) => {
            evento.preventDefault();
            const formulario = new FormData(evento.currentTarget);
            ejecutar(() =>
              guardarCatalogo(
                tipo,
                {
                  nombre: formulario.get("nombre"),
                  descripcion: formulario.get("descripcion"),
                  orden: formulario.get("orden"),
                  activo: formulario.has("activo"),
                },
                editar.id ? editar : null,
              ),
            );
          }}
        >
          <label>
            Nombre
            <CampoCorregido
              name="nombre"
              required
              maxLength={100}
              defaultValue={editar.nombre || ""}
            />
          </label>
          {tipo === "categorias" && (
            <>
              <label>
                Descripción
                <CampoCorregido name="descripcion" defaultValue={editar.descripcion || ""} />
              </label>
              <label>
                Orden
                <input
                  name="orden"
                  type="number"
                  min="0"
                  defaultValue={editar.orden ?? 0}
                />
              </label>
            </>
          )}
          <label className="casilla-administracion">
            <input
              name="activo"
              type="checkbox"
              defaultChecked={editar.activo}
            />
            Visible
          </label>
          <div className="selector-administracion campo-ancho-administracion">
            <button className="boton primario" disabled={ocupado}>
              Guardar
            </button>
            <button
              type="button"
              className="boton secundario"
              onClick={() => setEditar(null)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
