import Enlace from "../componentes/navegacion/Enlace";


export default function LogoEmpresa() {
  return (
    <Enlace
      href="/"
      className="logo-empresa"
      aria-label="CyberCorp · Inicio"
    >
      {/* Imagotipo utilizado en modo oscuro */}
      <img
        className="logo-tema logo-oscuro"
        src="/marca/Imagotipo-Oscuro.png"
        alt=""
        aria-hidden="true"
        width="576"
        height="121"
        decoding="async"
        draggable="false"
      />

      {/* Imagotipo utilizado en modo claro */}
      <img
        className="logo-tema logo-claro"
        src="/marca/Imagotipo-Claro.png"
        alt=""
        aria-hidden="true"
        width="649"
        height="120"
        decoding="async"
        draggable="false"
      />
    </Enlace>
  );
}