/**
 * Correcciones propias de autocorrección.
 * Estas se aplican ANTES del diccionario porque nspell da por válidas
 * muchas de ellas (clausula, aveces, osea...).
 *
 * Formato: { origen: "corrección" }
 * Las claves deben ir en minúscula; la capitalización se aplica en motor.js.
 */
export const CORRECCIONES_PROPIAS = {
  // Palabras sin tilde que nspell acepta → corrección con tilde
  clausula: "cláusula",
  articulo: "artículo",
  practico: "práctico",
  tecnico: "técnico",
  electronico: "electrónico",
  automatico: "automático",
  publico: "público",
  historico: "histórico",
  informatico: "informático",
  acustico: "acústico",

  // Palabras pegadas o mal separadas que el diccionario da por válidas
  porfavor: "por favor",
  deacuerdo: "de acuerdo",
  aveces: "a veces",
  atravez: "a través",
  osea: "o sea",
  sinembargo: "sin embargo",
  enserio: "en serio",
  masomenos: "más o menos",
  enseguida: "en seguida",
  porcierto: "por cierto",
  detodas: "de todas",
  derepente: "de repente",
  poreso: "por eso",

  // Abreviaciones informales
  xq: "porque",
  xque: "porque",
  porq: "porque",
  porqe: "porque",
  tb: "también",
  tmb: "también",
  tmbn: "también",
  bno: "bueno",
  xd: "XD",
  jajja: "jaja",
  jaajaja: "jajaja",
  bn: "bien",
  q: "que",   // solo si tiene >1 carácter de contexto – motor.js decide

  // Acrónimos (siempre mayúsculas)
  dni: "DNI",
  nit: "NIT",
  iva: "IVA",
  rut: "RUT",
  ruc: "RUC",
  nro: "N.°",
  cel: "cel.",

  // Días de la semana (minúscula en español)
  lunes: "lunes",
  martes: "martes",
  miércoles: "miércoles",
  miercoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  sábado: "sábado",
  sabado: "sábado",
  domingo: "domingo",

  // Meses (minúscula en español)
  enero: "enero",
  febrero: "febrero",
  marzo: "marzo",
  abril: "abril",
  mayo: "mayo",
  junio: "junio",
  julio: "julio",
  agosto: "agosto",
  septiembre: "septiembre",
  setiembre: "septiembre",
  octubre: "octubre",
  noviembre: "noviembre",
  diciembre: "diciembre",
};

/**
 * Claves que son acrónimos: siempre van en mayúsculas sin importar la
 * capitalización original de la palabra escrita.
 */
export const SIEMPRE_MAYUSCULAS = new Set(["dni", "nit", "iva", "rut", "ruc"]);

/**
 * Claves que son días/meses: solo se aplica la corrección cuando la
 * palabra NO está al inicio de una oración (motor.js lo decide).
 */
export const DIAS_Y_MESES = new Set([
  "lunes", "martes", "miércoles", "miercoles",
  "jueves", "viernes", "sábado", "sabado", "domingo",
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]);
