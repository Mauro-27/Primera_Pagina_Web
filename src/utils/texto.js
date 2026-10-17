// "Cerámica " y "ceramica" cuentan como la misma categoría (sin tildes, sin mayúsculas, sin espacios sobrantes)
export const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();