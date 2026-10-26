import { useState } from "react";
import { cn } from "../../utilidades/clases";

export default function ListaImagenesRevelables({
  items = [],
  className = "",
}) {
  const [idActivo, setIdActivo] = useState(null);

  if (!items.length) return null;

  return (
    <div className={cn("lista-imagenes-revelables", className)}>
      <ul className="lista-imagenes-revelables-items">
        {items.map((item, indice) => {
          const tieneImagen = Boolean(item.image?.trim());
          const activo = String(idActivo) === String(item.id);

          return (
            <li
              key={item.id}
              className={cn(
                "item-imagen-revelable",
                activo && "item-imagen-revelable-activo",
              )}
              onMouseEnter={() => setIdActivo(item.id)}
              onMouseLeave={() => setIdActivo(null)}
            >
              <button
                type="button"
                className="boton-imagen-revelable"
                onFocus={() => setIdActivo(item.id)}
                onBlur={() => setIdActivo(null)}
                onClick={() =>
                  setIdActivo((actual) =>
                    String(actual) === String(item.id)
                      ? null
                      : item.id,
                  )
                }
              >
                {tieneImagen && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className={cn(
                      "imagen-flotante-revelable",
                      activo && "imagen-flotante-revelable-activa",
                    )}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                <span className="numero-imagen-revelable">
                  {item.number ||
                    String(indice + 1).padStart(2, "0")}
                </span>

                <span className="informacion-imagen-revelable">
                  <strong>{item.title}</strong>

                  {item.subtitle && (
                    <small>{item.subtitle}</small>
                  )}
                </span>

                <span
                  className={cn(
                    "estado-imagen-revelable",
                    tieneImagen
                      ? "estado-imagen-disponible"
                      : "estado-imagen-ausente",
                  )}
                >
                  <i />

                  {tieneImagen
                    ? "Con imagen"
                    : "Sin imagen"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}