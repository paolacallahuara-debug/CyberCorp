import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/src/componentes/interfaz/base/PanelDeslizante";
import { useCarrito } from "../../../ganchos/useCarrito";
import { moneda } from "../../../utilidades/formateadores";
import { mensajePedido } from "../utilidades/formateadorWhatsApp";
import Icono from "../../../componentes/interfaz/Icono";
export default function DrawerCarrito({ consultar, datos }) {
  const { items, cantidad, abierto, setAbierto, total } = useCarrito();
  function finalizar() {
    const invalido = items.some((x) => {
      const p = datos.productos.find((p) => p.id === x.id && p.activo);
      return !p || p.stock < x.cantidad || p.precio !== x.precio;
    });
    if (invalido) {
      consultar(
        null,
        "El catálogo cambió. Retira los artículos y agrégalos de nuevo para actualizar precio y stock.",
      );
      return;
    }
    consultar(mensajePedido(items));
  }
  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetContent className="panel-carrito">
        <SheetTitle>
          Tu carrito <span className="cyan">({items.length})</span>
        </SheetTitle>
        <SheetDescription>Tu próxima mejora empieza aquí.</SheetDescription>
        <div className="carrito-items">
          {!items.length ? (
            <div className="vacio">
              <Icono nombre="ShoppingBag" size={54} />
              <h3>Tu carrito está vacío</h3>
              <p>Explora el catálogo y encuentra tu próxima solución.</p>
              <button
                className="boton primario"
                onClick={() => setAbierto(false)}
              >
                Seguir explorando
              </button>
            </div>
          ) : (
            items.map((p) => (
              <div className="carrito-item" key={p.id}>
                <div className="carrito-miniatura">
                  {(p.imagen || p.imagen_url) ? <img src={p.imagen || p.imagen_url} alt="" /> : <Icono nombre={p.icono} size={28} />}
                </div>
                <div>
                  <strong>{p.nombre}</strong>
                  <p>{moneda(p.precio)}</p>
                  <div className="cantidad">
                    <button
                      aria-label={"Restar " + p.nombre}
                      onClick={() => cantidad(p.id, p.cantidad - 1)}
                    >
                      −
                    </button>
                    <span>{p.cantidad}</span>
                    <button
                      aria-label={"Sumar " + p.nombre}
                      disabled={p.cantidad >= Math.floor(p.stock)}
                      onClick={() => cantidad(p.id, p.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="iconobtn"
                  aria-label={"Eliminar " + p.nombre}
                  onClick={() => cantidad(p.id, 0)}
                >
                  <Icono nombre="Trash2" size={17} />
                </button>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="resumen">
            <div>
              <span>Total del pedido</span>
              <strong>{moneda(total)}</strong>
            </div>
            <p>
              Confirma disponibilidad y solicita tu QR de pago por WhatsApp.
              Envío e instalación se cotizan por separado.
            </p>
            <button className="boton primario" onClick={finalizar}>
              <Icono nombre="MessageCircle" /> Solicitar QR por WhatsApp
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
