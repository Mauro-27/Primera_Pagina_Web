// Códigos de descuento de ejemplo (porcentaje). Deben coincidir con los de server/index.js
export const CODIGOS = {
  DISFRUTA10: 10,
};

// Limpia el string del precio para evitar $NaN: "$50.000" -> 50000
export const parsePrice = (precio) => {
  if (!precio) return 0;
  if (typeof precio === 'number') return precio;
  return Number(String(precio).replace(/[^0-9]/g, ''));
};

export const formatear = (valor) => `$${valor.toLocaleString('es-AR')}`;

// Si el precio viene de la base de datos como número (50000) lo muestra como "$50.000"; si ya es texto, lo deja igual
export const mostrarPrecio = (precio) => (typeof precio === 'number' ? formatear(precio) : precio);

export const precioDeItem = (item) => parsePrice(item.precio || item.price);

export const subtotalCarrito = (carrito) =>
  carrito.reduce((acc, item) => acc + precioDeItem(item) * (item.cantidad || 1), 0);

// El descuento se redondea por unidad, igual que en el servidor, para que el total coincida
export const descuentoCarrito = (carrito, porcentaje) => {
  if (!porcentaje) return 0;
  return carrito.reduce(
    (acc, item) =>
      acc + Math.round((precioDeItem(item) * porcentaje) / 100) * (item.cantidad || 1),
    0
  );
};