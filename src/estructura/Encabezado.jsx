import Link from "@/src/componentes/navegacion/Enlace";
import LogoEmpresa from "./LogoEmpresa";
import { useEffect, useState } from "react";
import { useTema } from "../ganchos/useTema";
import { useCarrito } from "../ganchos/useCarrito";
import Icono from "../componentes/interfaz/Icono";
export default function Encabezado({ pagina }) {
  const { tema, alternar } = useTema(),
    { contador, setAbierto } = useCarrito(),
    [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [pagina]);
  return (
    <div className="encabezado-pegajoso">
      <div className="topbar">
        <span>Tecnología que conecta. Seguridad que protege.</span>
        <span>
          Tarija, Bolivia <span className="top-divider">|</span> Atención
          personalizada
        </span>
      </div>
      <header className="cabecera">
        <LogoEmpresa />
        <nav className={menu ? "nav abierto" : "nav"}>
          {[
            ["Inicio", "/"],
            ["Productos", "/productos"],
            ["Cursos", "/cursos"],
            ["Servicios", "/servicios"],
            ["Testimonios", "/testimonios"],
            ["Sobre nosotros", "/nosotros"],
          ].map(([n, h]) => (
            <Link
              key={h}
              href={h}
              onClick={() => setMenu(false)}
              aria-current={pagina === h ? "page" : undefined}
              className={pagina === h ? "activo" : ""}
            >
              {n}
            </Link>
          ))}
        </nav>
        <div className="acciones">
          <button
            className="iconobtn"
            aria-label="Cambiar tema"
            onClick={alternar}
          >
            <Icono nombre={tema === "oscuro" ? "Sun" : "Moon"} />
          </button>
          <button
            className="carritobtn"
            onClick={() => setAbierto(true)}
            aria-label={`Abrir carrito, ${contador} productos`}
          >
            <Icono nombre="ShoppingBag" />
            <span className="texto-carrito">Carrito</span>
            <b>{contador}</b>
          </button>
          <button
            className="iconobtn menu"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label="Abrir navegación"
          >
            <Icono nombre="Menu" />
          </button>
        </div>
      </header>
    </div>
  );
}
