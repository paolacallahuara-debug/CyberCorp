import { useState } from "react";
import Icono from "../../../componentes/interfaz/Icono";
import { useCarrito } from "../../../ganchos/useCarrito";
import { moneda } from "../../../utilidades/formateadores";

export default function TarjetaProducto({ producto: p }) {
  const { agregar } = useCarrito();
  const [errorCarga, setErrorCarga] = useState(false);
  const urlFoto = (p.imagen || p.imagen_url || "").trim() || {
    camara: "/productos/camara.png",
    gps: "/productos/gps.jpg",
    kit: "/productos/kit.png",
    alexa: "/productos/alexa.png",
  }[p.id];
  const imagen = !errorCarga && urlFoto ? urlFoto : null;

  return (
    <article className="tarjeta-producto">
      <div className={`visual-producto${imagen ? " con-imagen" : ""}`}>
        <span className="etiqueta-producto">{p.categoria}</span>
        {imagen ? (
          <img
            className="imagen-producto"
            src={imagen}
            alt={`${p.nombre} — imagen referencial`}
            loading="lazy"
            decoding="async"
            width="400"
            height="400"
            onError={() => setErrorCarga(true)}
          />
        ) : (
          <Icono nombre={p.icono || "Package"} size={88} strokeWidth={1} />
        )}
        <span className="referencia-producto">
          {imagen ? "IMAGEN REFERENCIAL" : "CYBERCORP / TECH"}
        </span>
      </div>
      <div className="informacion-producto">
        <span className="estado-producto">
          {p.stock >= 1 ? "En stock" : "Agotado"}
        </span>
        <h3>{p.nombre}</h3>
        <p>{p.descripcion}</p>
        <div className="fila-precio-producto">
          <strong>{moneda(p.precio)}</strong>
          <button
            className="boton-agregar-producto"
            disabled={p.stock < 1}
            aria-label={`Agregar ${p.nombre}`}
            onClick={() => agregar(p)}
          >
            <Icono nombre="Plus" />
          </button>
        </div>
      </div>
    </article>
  );
}
