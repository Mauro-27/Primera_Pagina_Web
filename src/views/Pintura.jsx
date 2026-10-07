import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavoritosContext } from '../context/FavoritosContext.jsx';
import '../css/pintura.css'; 

const Pintura = ({ id, imagen, titulo, textoImagen, precio }) => {
    const { favoritos, toggleFavorito } = useContext(FavoritosContext);

    const esFavorito = favoritos.some(item => item.id === id);

    return (
        <div className="art-card">
            {/* Botón de favoritos */}
            <button 
                className="btn-favorito" 
                onClick={(e) => {
                    e.preventDefault(); // Evita que al tocar el corazón te lleve a la otra pantalla
                    toggleFavorito({ id, imagen, titulo, precio });
                }}
            >
                <i className={esFavorito ? "fa-solid fa-heart" : "fa-regular fa-heart"} 
                   style={{ color: esFavorito ? '#c94b4b' : '#a0a0a0' }}></i>
            </button>

            {/* Contenido clickeable que lleva al detalle */}
            <Link to={`/pintura/${id}`} className="art-link">
                <div className="art-image">
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
                </div>
            </Link>
        </div>
    );
};

export default Pintura;