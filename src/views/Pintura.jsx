import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FavoritosContext } from '../context/FavoritosContext.jsx';
import '../css/pintura.css';

const Pintura = ({ id, imagen, titulo, textoImagen, precio }) => {
    const { favoritos, toggleFavorito } = useContext(FavoritosContext);
    const [errorImagen, setErrorImagen] = useState(false);

    const esFavorito = favoritos.some(item => item.id === id);
    const mostrarImagen = imagen && !errorImagen;

    return (
        <article className="art-card">
            {/* Botón de favoritos (fuera del Link para no navegar al tocarlo) */}
            <button
                type="button"
                className={`btn-favorito ${esFavorito ? 'is-active' : ''}`}
                aria-label={esFavorito ? `Quitar ${titulo} de favoritos` : `Guardar ${titulo} en favoritos`}
                aria-pressed={esFavorito}
                onClick={() => toggleFavorito({ id, imagen, titulo, precio })}
            >
                <i className={esFavorito ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
            </button>

            {/* Contenido clickeable que lleva al detalle */}
            <Link to={`/pintura/${id}`} className="art-link">
                <div className="art-image">
                    {mostrarImagen ? (
                        <img
                            src={imagen}
                            alt={titulo}
                            loading="lazy"
                            onError={() => setErrorImagen(true)}
                        />
                    ) : (
                        <span className="art-placeholder">{textoImagen || 'Sin imagen'}</span>
                    )}
                </div>

                <div className="art-info">
                    <h3>{titulo}</h3>
                    <p className="price">{precio}</p>
                </div>
            </Link>
        </article>
    );
};

export default Pintura;