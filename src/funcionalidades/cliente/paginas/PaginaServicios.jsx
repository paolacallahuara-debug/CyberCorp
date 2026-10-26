import SeccionServicios from "../componentes/SeccionServicios";
export default function PaginaServicios({ datos, consultar }) {
  return (
    <>
      <div className="intro">
        <span className="eyebrow">SOLUCIONES PROFESIONALES</span>
        <h1>Conecta. Protege. Confía.</h1>
        <p>
          Instalación de GPS, cámaras, cercas eléctricas, alarmas y
          mantenimiento de equipos. Solicita tu cotización.
        </p>
      </div>
      <SeccionServicios datos={datos} consultar={consultar} />
    </>
  );
}
