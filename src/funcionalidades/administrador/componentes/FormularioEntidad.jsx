import { useState } from "react";
import CampoCorregido from "../../../componentes/interfaz/CampoCorregido.jsx";

// Nombres de campo que SÍ llevan corrector (texto en prosa)
const CAMPOS_CON_CORRECTOR = new Set([
  "titulo", "nombre", "nombre_cliente", "descripcion", "duracion",
  "modalidad", "direccion", "horarios", "eslogan",
]);

// Tipos HTML que NUNCA llevan corrector
const TIPOS_SIN_CORRECTOR = new Set([
  "url", "email", "number", "date", "datetime-local",
  "file", "hidden", "password", "checkbox", "radio",
]);

function valorFechaLocal(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor).slice(0, 16);
  const desplazamiento = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - desplazamiento).toISOString().slice(0, 16);
}

export default function FormularioEntidad({
  tipo,
  registro,
  datos,
  ocupado,
  enviar,
}) {
  const nuevo = !registro?.id;
  const [tipoVideo, setTipoVideo] = useState(registro?.tipoVideo || registro?.tipo_video || "url");

  const campo = (nombre, etiqueta, opciones = {}) => {
    const valor =
      registro?.[nombre] ??
      (nombre === "imagen" || nombre === "imagen_url"
        ? registro?.imagen_url || registro?.imagen
        : "") ??
      "";

    // Decide si usar CampoCorregido
    const tipoCampo = opciones.type;
    const usarCorrector =
      CAMPOS_CON_CORRECTOR.has(nombre) &&
      !TIPOS_SIN_CORRECTOR.has(tipoCampo);

    const { className: claseOpciones, ...restOpciones } = opciones;

    if (usarCorrector) {
      return (
        <label key={nombre} className={claseOpciones || ""}>
          {etiqueta}
          <CampoCorregido
            name={nombre}
            defaultValue={valor}
            {...restOpciones}
            className={undefined}
          />
        </label>
      );
    }

    return (
      <label key={nombre} className={claseOpciones || ""}>
        {etiqueta}
        <input name={nombre} defaultValue={valor} {...opciones} className={undefined} />
      </label>
    );
  };

  const casilla = (nombre, etiqueta) => (
    <label className="casilla-administracion" key={nombre}>
      <input
        type="checkbox"
        name={nombre}
        defaultChecked={registro?.[nombre] ?? (nombre === "activo" && nuevo)}
      />
      {etiqueta}
    </label>
  );

  if (tipo === "convenios") {
    return (
      <form className="formulario-entidad-administracion" onSubmit={enviar}>
        {campo("titulo", "Nombre o título del convenio", { required: true, maxLength: 200 })}
        <label className="campo-ancho-administracion">
          Descripción
          <CampoCorregido multiline name="descripcion" maxLength={1200} defaultValue={registro?.descripcion ?? ""} />
        </label>
        {campo("imagen_url", "URL de imagen · opcional", { type: "url", placeholder: "https://..." })}
        {campo("enlace_url", "Enlace externo · opcional", { type: "url", placeholder: "https://..." })}
        <label className="campo-ancho-administracion selector-imagen-administracion">
          O subir imagen del convenio
          <input name="archivo_imagen" type="file" accept="image/jpeg,image/png,image/webp" />
          <small>JPG, PNG o WebP · máximo 8 MB</small>
        </label>
        {casilla("activo", "Mostrar convenio en el sitio")}
        <button className="boton primario boton-guardar-administracion" type="submit" disabled={ocupado}>
          {ocupado ? "Guardando…" : nuevo ? "Crear convenio" : "Guardar cambios"}
        </button>
      </form>
    );
  }

  if (tipo === "testimonios") {
    return (
      <form className="formulario-entidad-administracion" onSubmit={enviar}>
        {campo("titulo", "Título del testimonio", { required: true, maxLength: 200 })}
        {campo("nombre_cliente", "Nombre del cliente · opcional", { maxLength: 200, defaultValue: registro?.nombreCliente || registro?.nombre_cliente || "" })}
        <label className="campo-ancho-administracion">
          Descripción / testimonio
          <CampoCorregido multiline name="descripcion" maxLength={1800} defaultValue={registro?.descripcion ?? ""} />
        </label>
        <label>
          Origen del video
          <select name="tipo_video" value={tipoVideo} onChange={(evento) => setTipoVideo(evento.target.value)}>
            <option value="url">Enlace externo</option>
            <option value="archivo">Video subido</option>
          </select>
        </label>
        {tipoVideo === "url" ? (
          <label className="campo-ancho-administracion">
            URL del video (YouTube, Facebook, Instagram, TikTok…)
            <input
              name="video_externo_url"
              type="url"
              required
              placeholder="https://..."
              defaultValue={registro?.videoExternoUrl || registro?.video_externo_url || ""}
            />
          </label>
        ) : (
          <>
            {registro?.videoUrl || registro?.video_url ? (
              <p className="aviso-archivo-administracion">Ya existe un video subido. Selecciona otro solo si quieres reemplazarlo.</p>
            ) : null}
            <label className="campo-ancho-administracion selector-imagen-administracion">
              Subir video del testimonio
              <input
                name="archivo_video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                required={nuevo}
              />
              <small>MP4, WebM, MOV o M4V · máximo 50 MB</small>
            </label>
            <input type="hidden" name="video_url" value={registro?.videoUrl || registro?.video_url || ""} />
          </>
        )}
        {casilla("activo", "Mostrar testimonio en el sitio")}
        <button className="boton primario boton-guardar-administracion" type="submit" disabled={ocupado}>
          {ocupado ? "Guardando…" : nuevo ? "Crear testimonio" : "Guardar cambios"}
        </button>
      </form>
    );
  }

  if (tipo === "tiktokPublicaciones") {
    return (
      <form className="formulario-entidad-administracion" onSubmit={enviar}>
        {campo("titulo", "Título · opcional", { maxLength: 200 })}
        <label className="campo-ancho-administracion">
          URL de la publicación de TikTok
          <input
            name="tiktok_url"
            type="url"
            required
            placeholder="https://www.tiktok.com/..."
            defaultValue={registro?.tiktokUrl || registro?.tiktok_url || ""}
          />
        </label>
        {casilla("activo", "Mostrar publicación en el sitio")}
        <button className="boton primario boton-guardar-administracion" type="submit" disabled={ocupado}>
          {ocupado ? "Guardando…" : nuevo ? "Agregar publicación" : "Guardar cambios"}
        </button>
      </form>
    );
  }

  return (
    <form className="formulario-entidad-administracion" onSubmit={enviar}>
      {campo("nombre", "Nombre", { required: true, maxLength: 200 })}

      <label className="campo-ancho-administracion">
        Descripción breve
        <CampoCorregido multiline name="descripcion" maxLength={300} defaultValue={registro?.descripcion ?? ""} />
      </label>

      {(tipo === "productos" || tipo === "ofertas") &&
        campo("codigo", "Código", { placeholder: "Se genera automáticamente si lo dejas vacío" })}

      {tipo !== "servicios" &&
        campo("precio", "Precio (Bs)", {
          type: "number",
          min: 0,
          step: ".01",
          required: tipo === "productos" || tipo === "ofertas",
        })}

      {tipo === "servicios" &&
        campo("precio_desde", "Precio desde (Bs) · opcional", {
          type: "number",
          min: 0,
          step: ".01",
          defaultValue: registro?.precioDesde ?? registro?.precio_desde ?? "",
        })}

      {tipo === "productos" && (
        <>
          {campo("stock", "Stock", { type: "number", min: 0, step: "1", required: true })}
          <label>
            Categoría
            <select name="categoria_id" defaultValue={registro?.categoria_id ?? ""}>
              <option value="">Sin categoría</option>
              {datos.categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Marca
            <select name="marca_id" defaultValue={registro?.marca_id ?? ""}>
              <option value="">Sin marca</option>
              {datos.marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
              ))}
            </select>
          </label>
          {campo("imagen_url", "URL de imagen · opcional", { type: "url", placeholder: "https://..." })}
          <label className="campo-ancho-administracion selector-imagen-administracion">
            O subir una imagen desde el dispositivo
            <input name="archivo_imagen" type="file" accept="image/jpeg,image/png,image/webp" />
            <small>JPG, PNG o WebP · máximo 8 MB</small>
          </label>
          {casilla("nuevo", "Mostrar como novedad")}
        </>
      )}

      {tipo === "cursos" && (
        <>
          {campo("duracion", "Duración · opcional")}
          {campo("modalidad", "Modalidad · opcional")}
          {campo("orden", "Orden", { type: "number", min: 0, step: 1 })}
          <label>
            Fecha de inicio · opcional
            <input name="fecha_inicio" type="datetime-local" defaultValue={valorFechaLocal(registro?.fecha_inicio)} />
          </label>
          <label>
            Fecha de finalización · opcional
            <input name="fecha_fin" type="datetime-local" defaultValue={valorFechaLocal(registro?.fecha_fin)} />
          </label>
        </>
      )}

      {tipo === "servicios" && campo("orden", "Orden", { type: "number", min: 0, step: 1 })}

      {(tipo === "cursos" || tipo === "servicios" || tipo === "ofertas") && (
        <>
          {campo("imagen_url", "URL de imagen · opcional", { type: "url", placeholder: "https://..." })}
          <label className="campo-ancho-administracion selector-imagen-administracion">
            O subir una imagen desde el dispositivo
            <input name="archivo_imagen" type="file" accept="image/jpeg,image/png,image/webp" />
            <small>JPG, PNG o WebP · máximo 8 MB</small>
          </label>
        </>
      )}

      {tipo === "ofertas" && (
        <>
          {campo("precio_anterior", "Precio anterior (Bs) · opcional", {
            type: "number",
            min: 0,
            step: ".01",
            defaultValue: registro?.anterior ?? registro?.precio_anterior ?? "",
          })}
          <label>
            Inicio · opcional
            <input name="fecha_inicio" type="datetime-local" defaultValue={valorFechaLocal(registro?.fecha_inicio)} />
          </label>
          <label>
            Fin · opcional
            <input name="fecha_fin" type="datetime-local" defaultValue={valorFechaLocal(registro?.fecha_fin)} />
          </label>
          <fieldset className="productos-kit-administracion campo-ancho-administracion">
            <legend>Productos incluidos en el kit</legend>
            {datos.productos.map((producto) => {
              const existente = registro?.productosKit?.find(
                (elemento) => elemento.producto_id === producto.id,
              );
              return (
                <div key={producto.id}>
                  <label>
                    <input type="checkbox" name="producto_ids" value={producto.id} defaultChecked={Boolean(existente)} />
                    <span>{producto.nombre}</span>
                  </label>
                  <input
                    name={`cantidad_${producto.id}`}
                    type="number"
                    aria-label={`Cantidad de ${producto.nombre}`}
                    min="1"
                    step="1"
                    defaultValue={existente?.cantidad || 1}
                  />
                </div>
              );
            })}
          </fieldset>
        </>
      )}

      {casilla("destacado", "Destacado en la tienda")}
      {casilla("activo", "Visible en el catálogo")}

      <button className="boton primario boton-guardar-administracion" type="submit" disabled={ocupado}>
        {ocupado ? "Guardando…" : nuevo ? "Crear registro" : "Guardar cambios"}
      </button>
    </form>
  );
}
