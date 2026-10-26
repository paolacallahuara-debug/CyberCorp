import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../utilidades/clases";


function FiltroGooey({
    idFiltro,
    desenfoque,
}) {
    return (
        <svg
            className="filtro-gooey-svg"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <filter
                    id={idFiltro}
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                >
                    <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation={desenfoque}
                        result="desenfoque"
                    />

                    <feColorMatrix
                        in="desenfoque"
                        type="matrix"
                        values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 20 -10
            "
                        result="goo"
                    />

                    <feComposite
                        in="SourceGraphic"
                        in2="goo"
                        operator="atop"
                    />
                </filter>
            </defs>
        </svg>
    );
}


function IconoBusqueda({
    layoutId,
}) {
    return (
        <motion.svg
            layoutId={layoutId}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="icono-busqueda-gooey"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="8" />

            <path d="m21 21-4.3-4.3" />
        </motion.svg>
    );
}


export default function EntradaBusquedaGooey({
    value = "",
    onValueChange,
    placeholder = "Buscar productos...",
    className = "",
    disabled = false,
}) {
    const idReact = useId();

    const idSeguro = idReact.replace(/:/g, "");

    const idFiltro = `filtro-gooey-${idSeguro}`;
    const idIcono = `icono-gooey-${idSeguro}`;

    const referenciaInput = useRef(null);

    const [expandido, setExpandido] =
        useState(Boolean(value));

    const reducirMovimiento =
        useReducedMotion();


    useEffect(() => {
        if (value) {
            setExpandido(true);
        }
    }, [value]);


    useEffect(() => {
        if (expandido) {
            window.requestAnimationFrame(() => {
                referenciaInput.current?.focus();
            });
        }
    }, [expandido]);


    const transicion = useMemo(
        () =>
            reducirMovimiento
                ? {
                    duration: 0,
                }
                : {
                    type: "spring",
                    duration: 0.52,
                    bounce: 0.32,
                },
        [reducirMovimiento],
    );


    const expandir = useCallback(() => {
        if (!disabled) {
            setExpandido(true);
        }
    }, [disabled]);


    const cambiarValor = useCallback(
        (evento) => {
            onValueChange?.(evento.target.value);
        },
        [onValueChange],
    );


    const manejarBlur = useCallback(() => {
        if (!value?.trim()) {
            setExpandido(false);
        }
    }, [value]);


    const limpiar = useCallback(() => {
        onValueChange?.("");

        referenciaInput.current?.focus();
    }, [onValueChange]);


    return (
        <div
            className={cn(
                "entrada-busqueda-gooey",
                expandido &&
                "entrada-busqueda-gooey-expandida",
                className,
            )}
        >
            <FiltroGooey
                idFiltro={idFiltro}
                desenfoque={5}
            />

            <div
                className="envoltura-filtro-gooey"
                style={{
                    filter: `url(#${idFiltro})`,
                }}
            >
                {/* Burbuja que aparece a la izquierda */}
                <motion.div
                    className="burbuja-busqueda-gooey"
                    initial={false}
                    animate={{
                        opacity: expandido ? 1 : 0,
                        scale: expandido ? 1 : 0,
                        x: expandido ? 0 : 10,
                    }}
                    transition={transicion}
                    aria-hidden="true"
                >
                    <IconoBusqueda
                        layoutId={idIcono}
                    />
                </motion.div>


                {/* Superficie principal */}
                <motion.div
                    className="superficie-busqueda-gooey"
                    initial={false}
                    animate={{
                        width: expandido
                            ? "var(--ancho-busqueda-expandida)"
                            : "var(--ancho-busqueda-colapsada)",

                        marginLeft: expandido
                            ? "var(--desplazamiento-busqueda)"
                            : "0px",
                    }}
                    transition={transicion}
                    onClick={expandir}
                >
                    {!expandido && (
                        <motion.span
                            className="icono-colapsado-busqueda-gooey"
                            initial={false}
                            animate={{
                                opacity: 1,
                            }}
                        >
                            <IconoBusqueda
                                layoutId={idIcono}
                            />
                        </motion.span>
                    )}


                    {!expandido && (
                        <span className="texto-busqueda-gooey">
                            Buscar
                        </span>
                    )}


                    {expandido && (
                        <input
                            ref={referenciaInput}
                            type="search"
                            value={value}
                            onChange={cambiarValor}
                            onBlur={manejarBlur}
                            disabled={disabled}
                            placeholder={placeholder}
                            autoComplete="off"
                            enterKeyHint="search"
                            className="campo-busqueda-gooey"
                            aria-label="Buscar productos"
                        />
                    )}


                    {expandido && value && (
                        <button
                            type="button"
                            className="limpiar-busqueda-gooey"
                            onMouseDown={(evento) => {
                                evento.preventDefault();
                            }}
                            onClick={(evento) => {
                                evento.stopPropagation();
                                limpiar();
                            }}
                            aria-label="Limpiar búsqueda"
                        >
                            ×
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
}