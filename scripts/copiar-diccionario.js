#!/usr/bin/env node
/**
 * Copia los archivos del diccionario español de dictionary-es
 * a public/diccionario/ para que Vite los sirva como estáticos.
 * Se ejecuta en predev y prebuild.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

// Ruta directa a los archivos dentro de node_modules/dictionary-es
const pkgDir = join(root, "node_modules", "dictionary-es");
const destDir = join(root, "public", "diccionario");

mkdirSync(destDir, { recursive: true });

copyFileSync(join(pkgDir, "index.aff"), join(destDir, "es.aff"));
copyFileSync(join(pkgDir, "index.dic"), join(destDir, "es.dic"));

console.log("✓ Diccionario español copiado a public/diccionario/");
