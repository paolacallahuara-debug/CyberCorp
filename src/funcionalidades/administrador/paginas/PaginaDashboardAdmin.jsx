import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../componentes/interfaz/base/Pestanas";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../componentes/interfaz/base/Dialogo";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../componentes/interfaz/base/Tabla";
import { Switch } from "../../../componentes/interfaz/base/Interruptor";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../componentes/interfaz/base/Confirmacion";
import FormularioEntidad from "../componentes/FormularioEntidad";
import GestionCatalogos from "../componentes/GestionCatalogos";
import Icono from "../../../componentes/interfaz/Icono";
import CampoCorregido from "../../../componentes/interfaz/CampoCorregido.jsx";
import { moneda } from "../../../utilidades/formateadores";
import { exportarDatos } from "../../migracion/migradorBD";
import { subirImagenCatalogo } from "../../../servicios/almacenamientoImagenes";
import { subirVideoTestimonio } from "../../../servicios/almacenamientoVideos";
import { restablecerRechazos, contarRechazos } from "../../../utilidades/autocorreccion/rechazos.js";
import { iniciarCargaInactiva } from "../../../servicios/diccionario.js";

const PRODUCTOS_POR_PAGINA_ADMIN = 20;
const modulos = [
  "productos",
  "cursos",
  "servicios",
  "ofertas",
  "convenios",
  "testimonios",
  "tiktokPublicaciones",
];

const nombreModulo = {
  productos: "Productos",
  cursos: "Cursos",
  servicios: "Servicios",
  ofertas: "Promociones",
  convenios: "Convenios",
  testimonios: "Testimonios",
  tiktokPublicaciones: "TikTok",
};

function crearPaginacion(paginaActual, totalPaginas) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }
  const paginas = new Set([1, totalPaginas, paginaActual - 1, paginaActual, paginaActual + 1]);
  if (paginaActual <= 4) [2, 3, 4, 5].forEach((pagina) => paginas.add(pagina));
  if (paginaActual >= totalPaginas - 3) {
    [totalPaginas - 1, totalPaginas - 2, totalPaginas - 3, totalPaginas - 4].forEach(
      (pagina) => paginas.add(pagina),
    );
  }
  const validas = [...paginas]
    .filter((pagina) => pagina >= 1 && pagina <= totalPaginas)
    .sort((a, b) => a - b);
  const salida = [];
  validas.forEach((pagina, indice) => {
    if (indice > 0 && pagina - validas[indice - 1] > 1) salida.push(`puntos-${pagina}`);
    salida.push(pagina);
  });
  return salida;
}

function fechaCorta(valor) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short", year: "numeric" }).format(fecha);
}

function nombreRegistro(tipo, elemento) {
  if (tipo === "testimonios") return elemento.titulo || elemento.nombreCliente || "Testimonio";
  if (tipo === "tiktokPublicaciones") return elemento.titulo || "Publicación de TikTok";
  if (tipo === "convenios") return elemento.titulo || "Convenio";
  return elemento.nombre;
}

function imagenRegistro(tipo, elemento) {
  if (
    ![
      "productos",
      "cursos",
      "servicios",
      "ofertas",
      "convenios",
    ].includes(tipo)
  ) {
    return "";
  }

  return (
    elemento.imagen ||
    elemento.imagen_url ||
    ""
  );
}

function subtituloImagenRegistro(tipo, elemento) {
  if (tipo === "productos") {
    return (
      elemento.codigo ||
      elemento.categoria ||
      "Producto"
    );
  }

  if (tipo === "cursos") {
    return elemento.modalidad || "Curso";
  }

  if (tipo === "servicios") {
    return "Servicio";
  }

  if (tipo === "ofertas") {
    return "Promoción";
  }

  if (tipo === "convenios") {
    return elemento.enlace
      ? "Convenio · enlace disponible"
      : "Convenio";
  }

  return "";
}

function columnasModulo(tipo) {
  if (tipo === "productos") return ["Nombre", "Precio", "Stock"];
  if (tipo === "cursos") return ["Nombre", "Precio", "Próximo inicio"];
  if (tipo === "servicios") return ["Nombre", "Desde", "Orden"];
  if (tipo === "ofertas") return ["Nombre", "Precio", "Vigencia"];
  if (tipo === "convenios") return ["Convenio", "Enlace", "Creado"];
  if (tipo === "testimonios") return ["Testimonio", "Video", "Cliente"];
  return ["Publicación", "Enlace", "Creado"];
}

function valorColumna(tipo, elemento, columna) {
  if (columna === 1) {
    if (tipo === "servicios") return elemento.precioDesde == null ? "A cotizar" : moneda(elemento.precioDesde);
    if (["productos", "cursos", "ofertas"].includes(tipo)) {
      return elemento.precio == null ? "A consultar" : moneda(elemento.precio);
    }
    if (tipo === "convenios") return elemento.enlace ? "Disponible" : "Sin enlace";
    if (tipo === "testimonios") return elemento.tipoVideo === "archivo" ? "Archivo" : "Externo";
    return elemento.tiktokUrl ? "Disponible" : "Sin enlace";
  }

  if (tipo === "productos") return elemento.stock;
  if (tipo === "cursos") return elemento.fecha_inicio ? fechaCorta(elemento.fecha_inicio) : elemento.modalidad || "A consultar";
  if (tipo === "servicios") return elemento.orden ?? "—";
  if (tipo === "ofertas") {
    if (!elemento.fecha_inicio && !elemento.fecha_fin) return "Sin límite";
    return `${fechaCorta(elemento.fecha_inicio)} – ${fechaCorta(elemento.fecha_fin)}`;
  }
  if (tipo === "convenios" || tipo === "tiktokPublicaciones") return fechaCorta(elemento.created_at);
  if (tipo === "testimonios") return elemento.nombreCliente || "No indicado";
  return "—";
}

export default function PaginaDashboardAdmin({
  datos,
  guardarEntidad,
  eliminarEntidad,
  guardarConfiguracion,
  guardarCatalogo,
  eliminarCatalogo,
}) {
  const [tab, setTab] = useState("productos");
  const [editor, setEditor] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [busquedaProductos, setBusquedaProductos] = useState("");
  const [categoriaProductos, setCategoriaProductos] = useState("Todos");
  const [categoriasExpandidas, setCategoriasExpandidas] = useState(false);
  const [paginaProductos, setPaginaProductos] = useState(1);
  const [cantidadRechazos, setCantidadRechazos] = useState(() => contarRechazos());

  // Inicia la carga diferida del diccionario en cuanto el panel monta
  useEffect(() => { iniciarCargaInactiva(); }, []);

  useEffect(() => setPaginaProductos(1), [busquedaProductos, categoriaProductos]);

  const categoriasProductosAdmin = useMemo(() => {
    const ordenadas = [...(datos.categorias || [])]
      .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
      .map((categoria) => categoria.nombre);
    const faltantes = [...new Set(datos.productos.map((producto) => producto.categoria).filter(Boolean))]
      .filter((nombre) => !ordenadas.includes(nombre));
    return ["Todos", ...ordenadas, ...faltantes];
  }, [datos.categorias, datos.productos]);

  const productosFiltrados = useMemo(() => {
    const termino = busquedaProductos.trim().toLocaleLowerCase("es");
    return datos.productos.filter((producto) => {
      if (categoriaProductos !== "Todos" && producto.categoria !== categoriaProductos) return false;
      if (!termino) return true;
      const texto = [producto.nombre, producto.codigo, producto.marca, producto.categoria, producto.descripcion]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");
      return texto.includes(termino);
    });
  }, [datos.productos, busquedaProductos, categoriaProductos]);

  const totalPaginasProductos = Math.max(
    1,
    Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA_ADMIN),
  );
  const paginaProductosSegura = Math.min(paginaProductos, totalPaginasProductos);
  const productosPaginaAdmin = productosFiltrados.slice(
    (paginaProductosSegura - 1) * PRODUCTOS_POR_PAGINA_ADMIN,
    paginaProductosSegura * PRODUCTOS_POR_PAGINA_ADMIN,
  );
  const paginasProductosAdmin = crearPaginacion(
    paginaProductosSegura,
    totalPaginasProductos,
  );

  async function actuar(operacion, exito) {
    setOcupado(true);
    try {
      await operacion();
      toast.success(exito);
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function enviar(evento) {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget);
    const archivoImagen = formulario.get("archivo_imagen");
    const archivoVideo = formulario.get("archivo_video");
    const valores = Object.fromEntries(formulario);
    delete valores.archivo_imagen;
    delete valores.archivo_video;

    for (const campo of ["activo", "destacado", "nuevo"]) {
      valores[campo] = formulario.has(campo);
    }

    for (const campo of ["precio", "stock", "precio_desde", "precio_anterior", "orden"]) {
      if (valores[campo] !== undefined && valores[campo] !== "") valores[campo] = Number(valores[campo]);
    }

    if (tab === "ofertas") {
      valores.productosKit = formulario.getAll("producto_ids").map((producto_id) => ({
        producto_id,
        cantidad: Number(formulario.get(`cantidad_${producto_id}`) || 1),
      }));
    }

    const valido = await actuar(async () => {
      if (archivoImagen instanceof File && archivoImagen.size > 0) {
        valores.imagen_url = await subirImagenCatalogo(archivoImagen, tab);
      }
      if (tab === "testimonios" && archivoVideo instanceof File && archivoVideo.size > 0) {
        valores.tipo_video = "archivo";
        valores.video_url = await subirVideoTestimonio(archivoVideo);
      }
      await guardarEntidad(tab, valores, editor?.id ? editor : null);
    }, "Registro guardado");

    if (valido) setEditor(null);
  }

  function elementosVisibles(tipo) {
    return tipo === "productos" ? productosPaginaAdmin : datos[tipo];
  }

  return (
    <section className="seccion panel-administracion">
      <div className="cabecera-panel-administracion">
        <div>
          <span className="eyebrow">CENTRO DE CONTROL</span>
          <h1>Gestión de CyberCorp</h1>
          <p>Datos conectados a Supabase · los cambios se reflejan en el sitio público.</p>
        </div>
      </div>

      <div className="resumen-administracion">
        {modulos.map((tipo) => (
          <div key={tipo}>
            <span>{nombreModulo[tipo]} activos</span>
            <strong>{datos[tipo].filter((elemento) => elemento.activo).length}</strong>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(valor) => { setTab(valor); setEditor(null); }}>
        <TabsList className="pestanas-administracion">
          {[...modulos, "catalogos", "configuracion", "migracion"].map((tipo) => (
            <TabsTrigger key={tipo} value={tipo}>
              {nombreModulo[tipo] ||
                (tipo === "configuracion"
                  ? "Configuración"
                  : tipo === "catalogos"
                    ? "Catálogos"
                    : "Exportar datos")}
            </TabsTrigger>
          ))}
        </TabsList>

        {modulos.map((tipo) => {
          const columnas = columnasModulo(tipo);
          const elementos = elementosVisibles(tipo);
          return (
            <TabsContent key={tipo} value={tipo}>
              <div className="cabecera-modulo-administracion">
                <div>
                  <h2>{nombreModulo[tipo]}</h2>
                  {tipo === "productos" && (
                    <p>{productosFiltrados.length} producto{productosFiltrados.length === 1 ? "" : "s"} encontrados</p>
                  )}
                </div>
                <button className="boton primario" onClick={() => setEditor({ activo: true })}>
                  <Icono nombre="Plus" size={18} /> Agregar
                </button>
              </div>

              {tipo === "productos" && (
                <div className="filtros-productos-administracion">
                  <div className="bloque-categorias-administracion">
                    <div className={`categorias-administracion${categoriasExpandidas ? " categorias-administracion-expandidas" : ""}`}>
                      {categoriasProductosAdmin.map((nombre) => (
                        <button
                          type="button"
                          key={nombre}
                          className={categoriaProductos === nombre ? "seleccionado" : ""}
                          onClick={() => setCategoriaProductos(nombre)}
                        >
                          {nombre}
                        </button>
                      ))}
                    </div>
                    {categoriasProductosAdmin.length > 6 && (
                      <button
                        className="boton-categorias-administracion"
                        type="button"
                        aria-expanded={categoriasExpandidas}
                        onClick={() => setCategoriasExpandidas((valor) => !valor)}
                      >
                        {categoriasExpandidas ? "Mostrar menos" : "Mostrar más"}
                        <Icono nombre={categoriasExpandidas ? "ChevronUp" : "ChevronDown"} size={17} />
                      </button>
                    )}
                  </div>
                  <label className="buscador-productos-administracion">
                    <Icono nombre="Search" size={19} />
                    <input
                      value={busquedaProductos}
                      onChange={(evento) => setBusquedaProductos(evento.target.value)}
                      placeholder="Buscar por nombre, código, marca…"
                      aria-label="Buscar productos en administración"
                    />
                  </label>
                </div>
              )}



              {elementos.length ? (
                <div className="tabla-administracion" id={tipo === "productos" ? "productos-administracion" : undefined}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{columnas[0]}</TableHead>
                        <TableHead>{columnas[1]}</TableHead>
                        <TableHead>{columnas[2]}</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {elementos.map((elemento) => (
                        <TableRow key={elemento.id} className={imagenRegistro(tipo, elemento) ? "fila-administracion-con-imagen" : ""}>
                          <TableCell data-etiqueta={columnas[0]}>
                            <div
                              className="registro-imagen-administracion"
                              tabIndex={imagenRegistro(tipo, elemento) ? 0 : undefined}
                            >
                              {imagenRegistro(tipo, elemento) && (
                                <img
                                  src={imagenRegistro(tipo, elemento)}
                                  alt={nombreRegistro(tipo, elemento)}
                                  className="imagen-flotante-tabla-administracion"
                                  loading="lazy"
                                  decoding="async"
                                />
                              )}

                              <div className="contenido-registro-administracion">
                                <strong>
                                  {nombreRegistro(tipo, elemento)}
                                </strong>

                                {elemento.destacado && (
                                  <small className="etiqueta-destacado-administracion">
                                    Destacado
                                  </small>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell data-etiqueta={columnas[1]}>{valorColumna(tipo, elemento, 1)}</TableCell>
                          <TableCell data-etiqueta={columnas[2]}>{valorColumna(tipo, elemento, 2)}</TableCell>
                          <TableCell data-etiqueta="Estado">
                            <Switch
                              aria-label={`Visibilidad de ${nombreRegistro(tipo, elemento)}`}
                              checked={elemento.activo}
                              disabled={ocupado}
                              onCheckedChange={(activo) =>
                                actuar(
                                  () => guardarEntidad(tipo, { ...elemento, activo }, elemento),
                                  "Estado actualizado",
                                )
                              }
                            />
                          </TableCell>
                          <TableCell data-etiqueta="Acciones">
                            <div className="acciones-tabla-administracion">
                              <button
                                className="iconobtn"
                                aria-label={`Editar ${nombreRegistro(tipo, elemento)}`}
                                onClick={() => setEditor(elemento)}
                              >
                                <Icono nombre="Pencil" size={18} />
                              </button>
                              <button
                                className="iconobtn"
                                aria-label={`Eliminar ${nombreRegistro(tipo, elemento)}`}
                                onClick={() => setEliminar({
                                  tipo,
                                  id: elemento.id,
                                  nombre: nombreRegistro(tipo, elemento),
                                })}
                              >
                                <Icono nombre="Trash2" size={18} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="estado-sin-datos">
                  {tipo === "productos" && datos.productos.length
                    ? "No hay productos que coincidan con esos filtros."
                    : `No hay registros en ${nombreModulo[tipo].toLowerCase()}. Usa «Agregar» para crear el primero.`}
                </p>
              )}

              {tipo === "productos" && productosFiltrados.length > PRODUCTOS_POR_PAGINA_ADMIN && (
                <nav className="paginacion-administracion" aria-label="Paginación de productos del administrador">
                  <button
                    type="button"
                    disabled={paginaProductosSegura === 1}
                    onClick={() => setPaginaProductos(paginaProductosSegura - 1)}
                    aria-label="Página anterior"
                  >
                    <Icono nombre="ChevronLeft" size={17} />
                  </button>
                  {paginasProductosAdmin.map((item) =>
                    typeof item === "number" ? (
                      <button
                        type="button"
                        key={item}
                        className={item === paginaProductosSegura ? "seleccionado" : ""}
                        aria-current={item === paginaProductosSegura ? "page" : undefined}
                        onClick={() => {
                          setPaginaProductos(item);
                          document.getElementById("productos-administracion")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={item}>…</span>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={paginaProductosSegura === totalPaginasProductos}
                    onClick={() => setPaginaProductos(paginaProductosSegura + 1)}
                    aria-label="Página siguiente"
                  >
                    <Icono nombre="ChevronRight" size={17} />
                  </button>
                </nav>
              )}
            </TabsContent>
          );
        })}

        <TabsContent value="catalogos">
          <GestionCatalogos
            datos={datos}
            guardarCatalogo={guardarCatalogo}
            eliminarCatalogo={eliminarCatalogo}
          />
        </TabsContent>

        <TabsContent value="configuracion">
          <div className="caja-administracion">
            <h2>Contacto, ubicación y redes de la empresa</h2>
            <form
              className="formulario-configuracion-administracion"
              onSubmit={async (evento) => {
                evento.preventDefault();
                const formulario = new FormData(evento.currentTarget);
                await actuar(
                  () =>
                    guardarConfiguracion({
                      whatsapp: String(formulario.get("whatsapp")).replace(/\D/g, ""),
                      whatsappCursos: String(formulario.get("whatsapp_cursos")).replace(/\D/g, ""),
                      whatsappServicios: String(formulario.get("whatsapp_servicios")).replace(/\D/g, ""),
                      telefono: formulario.get("telefono"),
                      email: formulario.get("email"),
                      direccion: formulario.get("direccion"),
                      ubicacionUrl: formulario.get("ubicacion_url"),
                      eslogan: formulario.get("eslogan"),
                      horarios: formulario.get("horarios"),
                      facebook: formulario.get("facebook"),
                      instagram: formulario.get("instagram"),
                      tiktok: formulario.get("tiktok"),
                      logo: formulario.get("logo"),
                    }),
                  "Configuración guardada",
                );
              }}
            >
              <label>
                WhatsApp general / productos
                <input name="whatsapp" required pattern="[1-9][0-9]{7,14}" defaultValue={datos.configuracion.whatsapp} />
              </label>
              <label>
                WhatsApp de cursos
                <input name="whatsapp_cursos" required pattern="[1-9][0-9]{7,14}" defaultValue={datos.configuracion.whatsappCursos} />
              </label>
              <label>
                WhatsApp de servicios
                <input name="whatsapp_servicios" required pattern="[1-9][0-9]{7,14}" defaultValue={datos.configuracion.whatsappServicios} />
              </label>
              <label>
                Teléfono
                <input name="telefono" defaultValue={datos.configuracion.telefono || ""} />
              </label>
              <label>
                Correo de contacto
                <input name="email" type="email" defaultValue={datos.configuracion.email || ""} />
              </label>
              <label className="campo-ancho-administracion">
                Dirección
                <CampoCorregido multiline name="direccion" defaultValue={datos.configuracion.direccion || ""} />
              </label>
              <label className="campo-ancho-administracion">
                Enlace de ubicación (Google Maps u otro mapa)
                <input name="ubicacion_url" type="url" placeholder="https://maps.google.com/..." defaultValue={datos.configuracion.ubicacionUrl || ""} />
              </label>
              <label className="campo-ancho-administracion">
                Horarios de atención
                <CampoCorregido multiline name="horarios" placeholder="Lunes a viernes: 08:30 - 18:30" defaultValue={datos.configuracion.horarios || ""} />
              </label>
              <label className="campo-ancho-administracion">
                Eslogan
                <CampoCorregido name="eslogan" defaultValue={datos.configuracion.eslogan || ""} />
              </label>
              <label>
                Facebook
                <input name="facebook" type="url" placeholder="https://..." defaultValue={datos.configuracion.facebook || ""} />
              </label>
              <label>
                Instagram
                <input name="instagram" type="url" placeholder="https://..." defaultValue={datos.configuracion.instagram || ""} />
              </label>
              <label>
                TikTok
                <input name="tiktok" type="url" placeholder="https://..." defaultValue={datos.configuracion.tiktok || ""} />
              </label>
              <label>
                URL de logo corporativo · opcional
                <input name="logo" type="url" placeholder="https://..." defaultValue={datos.configuracion.logo || ""} />
              </label>
              <button className="boton primario" disabled={ocupado}>Guardar configuración</button>
            </form>

            {/* ── Autocorrección ─────────────────────────────────────── */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
              <h3 style={{ marginBottom: "8px" }}>Autocorrección</h3>
              <p style={{ fontSize: "13px", marginBottom: "12px" }}>
                Palabras o correcciones que rechazaste no vuelven a aplicarse.
                {cantidadRechazos > 0 && ` Hay ${cantidadRechazos} rechazo${cantidadRechazos > 1 ? "s" : ""} guardado${cantidadRechazos > 1 ? "s" : ""}.`}
              </p>
              <button
                type="button"
                className="boton secundario"
                disabled={cantidadRechazos === 0}
                onClick={() => {
                  restablecerRechazos();
                  setCantidadRechazos(0);
                  toast.success("Autocorrección restablecida. Las correcciones vuelven a estar activas.");
                }}
              >
                Restablecer autocorrección
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="migracion">
          <div className="caja-administracion">
            <h2>Exportación JSON</h2>
            <p>Descarga una copia de los datos que el panel tiene cargados desde Supabase.</p>
            <div className="acciones-exportacion-administracion">
              <button className="boton primario" onClick={() => exportarDatos(datos)}>Descargar JSON</button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(editor)} onOpenChange={(abierto) => !abierto && setEditor(null)}>
        <DialogContent className="editor-administracion">
          <DialogTitle>
            {editor?.id ? "Editar" : "Agregar"} {nombreModulo[tab]?.toLowerCase()}
          </DialogTitle>
          <DialogDescription>Completa los campos y guarda el registro.</DialogDescription>
          {editor && (
            <FormularioEntidad
              key={editor.id || `nuevo-${tab}`}
              tipo={tab}
              registro={editor}
              datos={datos}
              ocupado={ocupado}
              enviar={enviar}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(eliminar)} onOpenChange={(abierto) => !abierto && setEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>{`¿Eliminar ${eliminar?.nombre}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción elimina el registro de Supabase y deja de mostrarlo en el sitio.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const bien = await actuar(
                  () => eliminarEntidad(eliminar.tipo, eliminar.id),
                  "Registro eliminado",
                );
                if (bien) setEliminar(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
