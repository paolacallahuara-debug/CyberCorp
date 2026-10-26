"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { esSupabase } from "../servicios/clienteSupabase";
const claveCarrito = esSupabase ? "cybercorp-carrito-supabase" : "cybercorp-carrito";
const Contexto = createContext(null);
export function CarritoProveedor({ children }) {
  const [items, setItems] = useState([]),
    [listo, setListo] = useState(false),
    [abierto, setAbierto] = useState(false);
  useEffect(() => {
    try {
      const x = JSON.parse(localStorage.getItem(claveCarrito) || "[]");
      if (Array.isArray(x))
        setItems(
          x.filter(
            (p) =>
              p.id &&
              Number.isInteger(p.cantidad) &&
              p.cantidad > 0 &&
              Number.isFinite(p.precio) &&
              p.precio >= 0,
          ),
        );
    } catch {
      // Un carrito local dañado se descarta sin impedir abrir la tienda.
    }
    setListo(true);
  }, []);
  useEffect(() => {
    if (listo) localStorage.setItem(claveCarrito, JSON.stringify(items));
  }, [items, listo]);
  function agregar(p) {
    const actual = items.find((x) => x.id === p.id);
    if ((actual?.cantidad || 0) >= Math.floor(p.stock)) {
      toast.error("No hay más unidades disponibles.");
      return;
    }
    setItems((xs) => {
      const x = xs.find((x) => x.id === p.id);
      return x
        ? xs.map((x) =>
            x.id === p.id ? { ...p, cantidad: x.cantidad + 1 } : x,
          )
        : [...xs, { ...p, cantidad: 1 }];
    });
    toast.success("Producto agregado al carrito");
  }
  function cantidad(id, n) {
    setItems((xs) =>
      xs
        .map((x) =>
          x.id === id ? { ...x, cantidad: Math.min(n, Math.floor(x.stock)) } : x,
        )
        .filter((x) => x.cantidad > 0),
    );
  }
  return (
    <Contexto.Provider
      value={{
        items,
        agregar,
        cantidad,
        abierto,
        setAbierto,
        total: items.reduce((s, x) => s + x.precio * x.cantidad, 0),
        contador: items.reduce((s, x) => s + x.cantidad, 0),
      }}
    >
      {children}
    </Contexto.Provider>
  );
}
export const useCarrito = () => useContext(Contexto);
