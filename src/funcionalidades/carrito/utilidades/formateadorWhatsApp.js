import { moneda } from "../../../utilidades/formateadores";
export function enlaceWhatsApp(numero, mensaje) {
  if (!/^[1-9]\d{7,14}$/.test(numero))
    throw new Error("Configura el número de WhatsApp en Administración.");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
export function mensajePedido(items) {
  return [
    "Hola CyberCorp, me interesa este pedido:",
    ...items.map(
      (p) => `• ${p.cantidad} × ${p.nombre}: ${moneda(p.precio * p.cantidad)}`,
    ),
    `Total: ${moneda(items.reduce((s, p) => s + p.precio * p.cantidad, 0))}`,
    "Por favor, confirmen disponibilidad y envíen el código QR de pago.",
  ].join("\n");
}
