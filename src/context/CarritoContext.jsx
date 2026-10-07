import { createContext, useState, useEffect } from 'react';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem('mi_carrito');
        return guardado ? JSON.parse(guardado) : [];
    });

    useEffect(() => {
        localStorage.setItem('mi_carrito', JSON.stringify(carrito));
    }, [carrito]);

    const agregarAlCarrito = (obra, cantidad) => {
        setCarrito((prev) => {
            const existe = prev.find(item => item.id === obra.id);
            if (existe) {
                // Si ya existe, le sumamos la nueva cantidad
                return prev.map(item => 
                    item.id === obra.id ? { ...item, cantidad: item.cantidad + cantidad } : item
                );
            }
            // Si no existe, lo agregamos como nuevo
            return [...prev, { ...obra, cantidad }];
        });
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter(item => item.id !== id));
    };

    return (
        <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito }}>
            {children}
        </CarritoContext.Provider>
    );
};