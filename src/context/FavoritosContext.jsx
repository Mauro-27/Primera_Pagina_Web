import { createContext, useState, useEffect } from 'react';

export const FavoritosContext = createContext();

export const FavoritosProvider = ({ children }) => {
    const [favoritos, setFavoritos] = useState(() => {
        const favsGuardados = localStorage.getItem('mis_favoritos');
        return favsGuardados ? JSON.parse(favsGuardados) : [];
    });

    useEffect(() => {
        localStorage.setItem('mis_favoritos', JSON.stringify(favoritos));
    }, [favoritos]);

    // Función que agrega o quita el favorito dependiendo de si ya existe
    const toggleFavorito = (pintura) => {
        setFavoritos((prev) => {
            const existe = prev.find((item) => item.id === pintura.id);
            if (existe) {
                return prev.filter((item) => item.id !== pintura.id); // Lo quita
            } else {
                return [...prev, pintura]; // Lo agrega
            }
        });
    };

    return (
        <FavoritosContext.Provider value={{ favoritos, toggleFavorito }}>
            {children}
        </FavoritosContext.Provider>
    );
};