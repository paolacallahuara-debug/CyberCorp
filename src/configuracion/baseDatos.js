const url = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || "";

// CyberCorp trabaja únicamente con Supabase. Ya no existe un proveedor local/JSON.
export const configuracion = {
  proveedor: "SUPABASE_DATABASE",
  url,
  clave,
};
