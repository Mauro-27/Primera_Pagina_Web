import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { CircularProgress, Snackbar } from '@mui/material';
import { supabase, urlImagen } from '../service/supabase';
import { mostrarPrecio } from '../utils/carritoUtils';
import { CarritoContext } from '../context/CarritoContext.jsx';
import { FavoritosContext } from '../context/FavoritosContext.jsx';
import '../css/detalle.css';

const DetallePintura = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [obra, setObra] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorImagen, setErrorImagen] = useState(false);
    const [cantidad, setCantidad] = useState(1);
    const [notificacion, setNotificacion] = useState(false);

    const { agregarAlCarrito } = useContext(CarritoContext);
    const { favoritos, toggleFavorito } = useContext(FavoritosContext);

    useEffect(() => {
        let activo = true;

        const cargarObra = async () => {
            setCargando(true);
            setErrorImagen(false);
            setCantidad(1);

            const { data, error } = await supabase
                .from('pinturas') // <-- nombre de tu tabla
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (!activo) return;
            if (error) console.error('Error al cargar la obra:', error);

            // Convierte el nombre del archivo en la dirección completa de la foto
            setObra(data ? { ...data, imagen: urlImagen(data.imagen) } : null);
            setCargando(false);
        };

        cargarObra();

        return () => {
            activo = false;
        };
    }, [id]);

    if (cargando) {
        return (
            <div className="detalle-estado">
                <CircularProgress sx={{ color: 'var(--primary-color)' }} aria-label="Cargando obra" />
            </div>
        );
    }

    if (!obra) {
        return (
            <div className="detalle-estado">
                <p>Obra no encontrada.</p>
                <Link to="/productos" className="detalle-enlace">
                    Ver todas las obras
                </Link>
            </div>
        );
    }

    /* ===== Datos derivados ===== */
    const agotada = typeof obra.stock === 'number' && obra.stock <= 0;
    const unica = obra.stock === 1;
    const maximo = typeof obra.stock === 'number' ? obra.stock : 99; // no se puede pedir más que el stock
    const esFavorito = favoritos.some((item) => item.id === obra.id);

    // Campo opcional: lista de medidas o detalles (por ejemplo ["Alto: 50 cm", "Técnica: óleo"])
    const medidas = Array.isArray(obra.medidas) ? obra.medidas : [];

    /* ===== Acciones ===== */
    const cambiarCantidad = (delta) =>
        setCantidad((actual) => Math.min(Math.max(actual + delta, 1), maximo));

    const manejarAgregar = () => {
        agregarAlCarrito(obra, cantidad);
        setNotificacion(true);
    };

    const manejarComprarAhora = () => {
        agregarAlCarrito(obra, cantidad);
        navigate('/carrito');
    };

    const manejarFavorito = () =>
        toggleFavorito({ id: obra.id, imagen: obra.imagen, titulo: obra.titulo, precio: obra.precio });

    return (
        <div className="detalle">
            {/* ===== Migas de pan ===== */}
            <nav className="detalle-migas" aria-label="Ubicación">
                <ol>
                    <li>
                        <Link to="/">Inicio</Link>
                    </li>
                    <li>
                        <Link to="/productos">Productos</Link>
                    </li>
                    {obra.categoria && (
                        <li>
                            <Link to={`/productos?categoria=${encodeURIComponent(obra.categoria)}`}>
                                {obra.categoria}
                            </Link>
                        </li>
                    )}
                    <li aria-current="page">{obra.titulo}</li>
                </ol>
            </nav>

            <div className="detalle-layout">
                {/* ===== Izquierda: imagen ===== */}
                <div className="detalle-imagen">
                    {obra.imagen && !errorImagen ? (
                        <img src={obra.imagen} alt={obra.titulo} onError={() => setErrorImagen(true)} />
                    ) : (
                        <span className="detalle-sin-imagen">Sin imagen</span>
                    )}

                </div>

                {/* ===== Derecha: panel de compra ===== */}
                <div className="detalle-panel">
                    {(unica || agotada) && (
                        <span className={`detalle-etiqueta ${agotada ? 'agotada' : ''}`}>
                            <i
                                className={agotada ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-certificate'}
                                aria-hidden="true"
                            ></i>
                            {agotada ? 'Agotada' : 'Pieza única'}
                        </span>
                    )}

                    <h1 className="detalle-titulo">{obra.titulo}</h1>

                    <p className="detalle-precio">{mostrarPrecio(obra.precio)}</p>
                    <p className="detalle-nota-precio">
                        <i className="fa-solid fa-lock" aria-hidden="true"></i>
                        Pago seguro con Mercado Pago
                    </p>

                    {obra.descripcion && <p className="detalle-descripcion">{obra.descripcion}</p>}

                    {medidas.length > 0 && (
                        <ul className="detalle-medidas">
                            {medidas.map((medida) => (
                                <li key={medida}>
                                    <span className="detalle-check" aria-hidden="true">
                                        <i className="fa-solid fa-check"></i>
                                    </span>
                                    {medida}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Cantidad: solo si se puede pedir más de una unidad */}
                    {!agotada && maximo > 1 && (
                        <div className="detalle-cantidad">
                            <span>Cantidad</span>
                            <div className="detalle-cantidad-control">
                                <button
                                    type="button"
                                    onClick={() => cambiarCantidad(-1)}
                                    disabled={cantidad <= 1}
                                    aria-label="Restar una unidad"
                                >
                                    <i className="fa-solid fa-minus"></i>
                                </button>
                                <strong aria-live="polite">{cantidad}</strong>
                                <button
                                    type="button"
                                    onClick={() => cambiarCantidad(1)}
                                    disabled={cantidad >= maximo}
                                    aria-label="Sumar una unidad"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <button
                        type="button"
                        className="detalle-btn detalle-btn--principal"
                        onClick={manejarComprarAhora}
                        disabled={agotada}
                    >
                        {agotada ? 'Agotada' : 'Comprar ahora'}
                    </button>

                    <div className="detalle-acciones">
                        <button
                            type="button"
                            className="detalle-btn detalle-btn--secundario"
                            onClick={manejarAgregar}
                            disabled={agotada}
                        >
                            <i className="fa-solid fa-bag-shopping" aria-hidden="true"></i>
                            Añadir al carrito
                        </button>

                        <button
                            type="button"
                            className={`detalle-btn detalle-btn--secundario ${esFavorito ? 'es-favorito' : ''}`}
                            onClick={manejarFavorito}
                            aria-pressed={esFavorito}
                        >
                            <i
                                className={esFavorito ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
                                aria-hidden="true"
                            ></i>
                            {esFavorito ? 'Guardado en favoritos' : 'Guardar en favoritos'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Aviso tipo toast */}
            <Snackbar
                open={notificacion}
                autoHideDuration={3000}
                onClose={() => setNotificacion(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <div className="detalle-toast" role="status">
                    <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                    <span>Agregado al carrito</span>
                </div>
            </Snackbar>
        </div>
    );
};

export default DetallePintura;