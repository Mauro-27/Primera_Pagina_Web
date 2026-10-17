import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FavoritosContext } from '../context/FavoritosContext.jsx';
import { CarritoContext } from '../context/CarritoContext.jsx';
import { mostrarPrecio } from '../utils/carritoUtils';
import '../css/pintura.css';

const Pintura = ({ id, imagen, titulo, textoImagen, precio, descripcion, stock, categoria }) => {
    const { favoritos, toggleFavorito } = useContext(FavoritosContext);
    const { agregarAlCarrito } = useContext(CarritoContext);
    const [errorImagen, setErrorImagen] = useState(false);
    const [agregado, setAgregado] = useState(false);
    const temporizador = useRef(null);

    // Limpia el temporizador si la tarjeta desaparece
    useEffect(() => () => clearTimeout(temporizador.current), []);

    const esFavorito = favoritos.some((item) => item.id === id);
    const mostrarImagen = imagen && !errorImagen;

    // stock: 0 = agotada, 1 = pieza única, vacío = no se controla
    const agotada = typeof stock === 'number' && stock <= 0;
    const unica = stock === 1;

    const manejarAgregar = () => {
        agregarAlCarrito({ id, titulo, precio, imagen }, 1);
        setAgregado(true);
        clearTimeout(temporizador.current);
        temporizador.current = setTimeout(() => setAgregado(false), 1600);
    };

    return (
        <article className={`art-card ${agotada ? 'agotada' : ''}`}>
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

            {/* Imagen y texto: llevan al detalle */}
            <Link to={`/pintura/${id}`} className="art-link">
                <div className="art-image">
                    {mostrarImagen ? (
                        <img src={imagen} alt={titulo} loading="lazy" onError={() => setErrorImagen(true)} />
                    ) : (
                        <span className="art-placeholder">{textoImagen || 'Sin imagen'}</span>
                    )}

                    {(agotada || unica || categoria) && (
                        <div className="art-badges">
                            {agotada && <span className="art-badge art-badge--agotada">Agotada</span>}
                            {!agotada && unica && <span className="art-badge art-badge--unica">Pieza única</span>}
                        </div>
                    )}
                </div>

                <div className="art-info">
                    <h3>{titulo}</h3>
                    {descripcion && <p className="art-descripcion">{descripcion}</p>}
                </div>
            </Link>

            {/* Precio y botón */}
            <div className="art-pie">
                <div>
                    <span className="art-precio-label">Precio</span>
                    <p className="price">{mostrarPrecio(precio)}</p>
                </div>

                <button
                    type="button"
                    className={`btn-agregar ${agregado ? 'is-agregado' : ''}`}
                    onClick={manejarAgregar}
                    disabled={agotada}
                >
                    <i className={agregado ? 'fa-solid fa-check' : 'fa-solid fa-bag-shopping'} aria-hidden="true"></i>
                    {agotada ? 'Agotada' : agregado ? 'Agregada' : 'Agregar'}
                </button>
            </div>
        </article>
    );
};

export default Pintura;