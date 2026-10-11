import { createContext, useState, useEffect } from 'react';

export const CarritoContext = createContext();

// Helper para asegurar que el precio sea numérico para los cálculos
export const obtenerPrecioNumerico = (precio) => {
  if (!precio) return 0;
  if (typeof precio === 'number') return precio;
  // Elimina cualquier caracter que no sea número (ej: '$', '.')
  return Number(String(precio).replace(/[^0-9]/g, ''));
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito');
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) return; // Evita que la cantidad sea 0 o negativa
    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item))
    );
  };

  const vaciarCarrito = () => setCarrito([]);

  // Cálculo seguro del total usando el helper numérico
  const totalCarrito = carrito.reduce(
    (acc, item) => acc + obtenerPrecioNumerico(item.precio) * item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        totalCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};