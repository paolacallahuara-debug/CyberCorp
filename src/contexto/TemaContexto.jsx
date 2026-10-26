"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";


const Contexto = createContext(null);


function obtenerTemaInicial() {
  const temaDocumento =
    document.documentElement.dataset.tema;

  if (
    temaDocumento === "claro" ||
    temaDocumento === "oscuro"
  ) {
    return temaDocumento;
  }

  return "oscuro";
}


export function TemaProveedor({
  children,
}) {
  const [tema, setTema] =
    useState(obtenerTemaInicial);


  /*
   * useLayoutEffect ocurre antes de que el
   * navegador pinte el siguiente frame.
   *
   * Así evitamos que el logo y los colores
   * queden un frame atrasados.
   */
  useLayoutEffect(() => {
    document.documentElement.dataset.tema =
      tema;

    try {
      localStorage.setItem(
        "cybercorp-tema",
        tema,
      );
    } catch {
      /* localStorage puede estar bloqueado */
    }
  }, [tema]);


  function alternar() {
    setTema((temaActual) =>
      temaActual === "oscuro"
        ? "claro"
        : "oscuro",
    );
  }


  return (
    <Contexto.Provider
      value={{
        tema,
        alternar,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}


export const useTema = () =>
  useContext(Contexto);