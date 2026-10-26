import { createClient } from "@supabase/supabase-js";
import { configuracion } from "./baseDatos";
export const clienteSupabase =
  configuracion.url && configuracion.clave
    ? createClient(configuracion.url, configuracion.clave)
    : null;
