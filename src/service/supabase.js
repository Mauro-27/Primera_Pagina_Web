import { createClient } from '@supabase/supabase-js';

// La URL es solo la dirección del proyecto, SIN "/rest/v1/" al final
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Usa la clave "anon" (o "publishable"). NUNCA la "service_role": esa es secreta
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Nombre del bucket de Supabase Storage donde subiste las fotos (cámbialo si tu bucket se llama distinto)
const BUCKET_IMAGENES = 'pinturas';

// En la tabla guardas solo el nombre del archivo ("pintura1.png"); esto lo convierte en la dirección completa de la foto.
// Si ya es una URL completa o una ruta que empieza con "/", la deja como está.
export const urlImagen = (ruta) => {
  if (!ruta) return '';
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith('/')) return ruta;
  const { data } = supabase.storage.from(BUCKET_IMAGENES).getPublicUrl(ruta);
  return data.publicUrl;
};