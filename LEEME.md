# CyberCorp

Proyecto React + Vite conectado únicamente a Supabase.

## Inicio rápido

```bash
npm install
npm run dev
```

Configura `.env.local` con:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

Para las funciones nuevas (convenios, testimonios, TikTok, fechas de cursos, ubicación y WhatsApp separados) ejecuta primero en Supabase:

```text
base_de_datos/migraciones/006_contenido_institucional_testimonios.sql
```

La documentación completa está en `DOCUMENTACION_PROYECTO.md`.
