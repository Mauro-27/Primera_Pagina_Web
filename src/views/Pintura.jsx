import { useState, useContext } from 'react';
import { FavoritosContext } from '../context/FavoritosContext.jsx';
import '../css/pintura.css'; 

// IMPORTANTE: Agregamos "id" a las props
const Pintura = ({ id, imagen, titulo, textoImagen, precio }) => {
    const [vendido, setVendido] = useState(false);
    const { favoritos, toggleFavorito } = useContext(FavoritosContext);

    // Verificamos si esta pintura en particular ya está en la lista de favoritos
    const esFavorito = favoritos.some(item => item.id === id);

    return (
        <div className="art-card">
            {/* El contenedor de la imagen necesita position relative para ubicar el corazón */}
            <div className="art-image" style={{ position: 'relative' }}>
                
                {/* Botón de corazón */}
                <button 
                    className="btn-favorito" 
                    onClick={() => toggleFavorito({ id, imagen, titulo, precio })}
                >
                    <i className={esFavorito ? "fa-solid fa-heart" : "fa-regular fa-heart"} 
                       style={{ color: esFavorito ? '#c94b4b' : '#3b82f6' }}></i>
                </button>

                {imagen ? (
                    <img 
                        src={imagen} 
                        alt={titulo} 
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = 'https://via.placeholder.com/250x250?text=Sin+Imagen'; 
                        }} 
                    />
                ) : (
                    <span>{textoImagen}</span>
                )}
            </div>
        
            <div className="art-info">
                <h3>{titulo}</h3>
                <p className="price">{precio}</p>
                <p><b>Estado: </b>{ vendido ? "Vendido" : "A la Venta" }</p>
                {
                    !vendido && <button className="btn-buy">Comprar</button>
                }
            </div>
        </div>
    );
};

export default Pintura;