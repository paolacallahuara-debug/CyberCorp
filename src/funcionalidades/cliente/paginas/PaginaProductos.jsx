import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import TarjetaProducto from "../componentes/TarjetaProducto";
import Icono from "../../../componentes/interfaz/Icono";
import EfectoHoverTarjetas from "../../../componentes/interfaz/EfectoHoverTarjetas";
import EntradaBusquedaGooey from "../../../componentes/interfaz/EntradaBusquedaGooey";

const PRODUCTOS_POR_PAGINA = 20;

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

export default function PaginaProductos({ datos }) {
  const [parametros] = useSearchParams();
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState(false);

  useEffect(() => {
    const categoriaInicial = parametros.get("categoria") || "Todos";
    setCategoria(categoriaInicial);
    setCategoriasExpandidas(categoriaInicial !== "Todos");
  }, [parametros]);

  useEffect(() => {
    setPagina(1);
  }, [categoria, busqueda]);

  const categorias = useMemo(() => {
    const nombresConProductos = new Set(
      (datos.productos || [])
        .filter((producto) => producto.activo)
        .map((producto) => producto.categoria)
        .filter(Boolean),
    );
    const categoriasValidas = (datos.categorias || [])
      .filter(
        (item) => item.activo !== false && nombresConProductos.has(item.nombre),
      )
      .map((item) => item.nombre);
    const faltantes = [...nombresConProductos].filter(
      (nombre) => !categoriasValidas.includes(nombre),
    );
    const listaCompleta = [...new Set([...categoriasValidas, ...faltantes])];

    const esOtrosProductos = (nombre) => {
      const normalizado = String(nombre || "").trim().toLowerCase();
      return normalizado === "otros productos" || normalizado === "otros";
    };

    const categoriasRegulares = listaCompleta
      .filter((nombre) => !esOtrosProductos(nombre))
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    const categoriasOtros = listaCompleta.filter((nombre) =>
      esOtrosProductos(nombre),
    );

    return ["Todos", ...categoriasRegulares, ...categoriasOtros];
  }, [datos.categorias, datos.productos]);

  const lista = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    return datos.productos.filter((producto) => {
      if (!producto.activo) return false;
      if (categoria !== "Todos" && producto.categoria !== categoria) return false;
      if (!termino) return true;
      const texto = [producto.nombre, producto.descripcion, producto.marca, producto.codigo]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");
      return texto.includes(termino);
    });
  }, [datos.productos, categoria, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / PRODUCTOS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const productosPagina = useMemo(
    () =>
      lista.slice(
        (paginaSegura - 1) * PRODUCTOS_POR_PAGINA,
        paginaSegura * PRODUCTOS_POR_PAGINA,
      ),
    [lista, paginaSegura],
  );
  const paginas = crearPaginacion(paginaSegura, totalPaginas);

  function cambiarPagina(nuevaPagina) {
    setPagina(nuevaPagina);
    requestAnimationFrame(() => {
      document.getElementById("lista-productos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <section className="seccion catalogo catalogo-productos">
      <span className="eyebrow">TECNOLOGÍA A TU ALCANCE</span>
      <h1>Encuentra tu próxima mejora.</h1>
      <p>Seguridad, conectividad y todo lo que necesitas para ir más allá.</p>

      <div className="panel-filtros-productos">
        <div className="bloque-categorias-productos">
          <div
            className={`categorias-productos${categoriasExpandidas ? " categorias-productos-expandidas" : ""}`}
          >
            {categorias.map((nombre) => (
              <button
                key={nombre}
                className={categoria === nombre ? "seleccionado" : ""}
                onClick={() => setCategoria(nombre)}
              >
                {nombre}
              </button>
            ))}
          </div>
          {categorias.length > 6 && (
            <button
              className="boton-desplegar-categorias"
              type="button"
              aria-expanded={categoriasExpandidas}
              onClick={() => setCategoriasExpandidas((valor) => !valor)}
            >
              {categoriasExpandidas ? "Mostrar menos" : "Mostrar más"}
              <Icono
                nombre={categoriasExpandidas ? "ChevronUp" : "ChevronDown"}
                size={17}
              />
            </button>
          )}
        </div>

        <div className="contenedor-buscador-productos">
          <EntradaBusquedaGooey
            value={busqueda}
            onValueChange={setBusqueda}
            placeholder="Buscar por nombre, marca o código…"
          />
        </div>
      </div>

      <div className="resumen-productos" id="lista-productos">
        <p>
          {lista.length} {lista.length === 1 ? "producto" : "productos"}
        </p>
        {lista.length > 0 && (
          <span>
            Página {paginaSegura} de {totalPaginas}
          </span>
        )}
      </div>

      <EfectoHoverTarjetas
        elementos={productosPagina}
        className="rejilla-productos"
        renderizar={(producto) => (
          <TarjetaProducto
            producto={producto}
          />
        )}
      />

      {!lista.length && (
        <div className="vacio">
          <h2>No encontramos productos</h2>
          <p>Prueba otra categoría o cambia tu búsqueda.</p>
        </div>
      )}

      {lista.length > PRODUCTOS_POR_PAGINA && (
        <nav className="paginacion-productos" aria-label="Paginación de productos">
          <button
            className="boton-pagina boton-pagina-navegacion"
            disabled={paginaSegura === 1}
            aria-label="Página anterior"
            onClick={() => cambiarPagina(paginaSegura - 1)}
          >
            <Icono nombre="ChevronLeft" size={18} />
          </button>
          {paginas.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                className={`boton-pagina${item === paginaSegura ? " seleccionado" : ""}`}
                aria-current={item === paginaSegura ? "page" : undefined}
                onClick={() => cambiarPagina(item)}
              >
                {item}
              </button>
            ) : (
              <span className="puntos-paginacion" key={item} aria-hidden="true">
                …
              </span>
            ),
          )}
          <button
            className="boton-pagina boton-pagina-navegacion"
            disabled={paginaSegura === totalPaginas}
            aria-label="Página siguiente"
            onClick={() => cambiarPagina(paginaSegura + 1)}
          >
            <Icono nombre="ChevronRight" size={18} />
          </button>
        </nav>
      )}
    </section>
  );
}
