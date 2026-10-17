import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CircularProgress, Slider } from '@mui/material';
import Pintura from './Pintura.jsx';
import { supabase, urlImagen } from '../service/supabase';
import { formatear, parsePrice } from '../utils/carritoUtils';
import { normalizarTexto } from '../utils/texto';
import '../css/galeria.css';

const ORDENADORES = {
    recientes: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id,
    'precio-asc': (a, b) => parsePrice(a.precio) - parsePrice(b.precio),
    'precio-desc': (a, b) => parsePrice(b.precio) - parsePrice(a.precio),
    nombre: (a, b) => String(a.titulo).localeCompare(String(b.titulo), 'es'),
};

const estaDisponible = (obra) =>
    obra.stock === null || obra.stock === undefined || obra.stock > 0;

const Galeria = () => {
    const [obras, setObras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Filtros
    const [searchParams, setSearchParams] = useSearchParams(); // ?categoria=Cerámica&categoria=Textil
    const [rangoUsuario, setRangoUsuario] = useState(null); // null = sin filtrar por precio
    const [soloDisponibles, setSoloDisponibles] = useState(false);
    const [orden, setOrden] = useState('recientes');
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false); // solo se usa en celular

    useEffect(() => {
        let activo = true;

        const cargarObras = async () => {
            const { data, error } = await supabase
                .from('pinturas') // <-- nombre de tu tabla
                .select('*');

            if (!activo) return;

            if (error) {
                console.error('Error al cargar las pinturas:', error);
                setError('No se pudieron cargar las pinturas. Intenta de nuevo más tarde.');
            } else {
                // Convierte el nombre del archivo en la dirección completa de la foto
                setObras(data.map((obra) => ({ ...obra, imagen: urlImagen(obra.imagen) })));
            }
            setCargando(false);
        };

        cargarObras();

        return () => {
            activo = false;
        };
    }, []);

    if (cargando) {
        return (
            <div className="catalogo-estado">
                <CircularProgress sx={{ color: 'var(--primary-color)' }} aria-label="Cargando pinturas" />
            </div>
        );
    }

    if (error) {
        return <p className="catalogo-estado catalogo-estado--error">{error}</p>;
    }

    /* ===== Datos derivados (se recalculan en cada render; el catálogo es chico) ===== */

    // Categorías que existen en tu tabla, con cuántas piezas tiene cada una
    const mapaCategorias = new Map();
    for (const obra of obras) {
        if (!obra.categoria) continue;
        const clave = normalizarTexto(obra.categoria);
        if (!mapaCategorias.has(clave)) {
            mapaCategorias.set(clave, { clave, nombre: String(obra.categoria).trim(), cantidad: 0 });
        }
        mapaCategorias.get(clave).cantidad += 1;
    }
    const categorias = [...mapaCategorias.values()].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es')
    );
    const nombrePorClave = Object.fromEntries(categorias.map((c) => [c.clave, c.nombre]));

    // Rango de precios disponible
    const precios = obras.map((o) => parsePrice(o.precio));
    const precioMin = precios.length ? Math.min(...precios) : 0;
    const precioMax = precios.length ? Math.max(...precios) : 0;
    const rango = rangoUsuario || [precioMin, precioMax];

    // Filtros activos
    const seleccionadas = searchParams.getAll('categoria').map(normalizarTexto);
    const hayFiltros = seleccionadas.length > 0 || rangoUsuario !== null || soloDisponibles;

    const visibles = obras
        .filter((obra) => {
            const precio = parsePrice(obra.precio);
            if (seleccionadas.length && !seleccionadas.includes(normalizarTexto(obra.categoria))) return false;
            if (precio < rango[0] || precio > rango[1]) return false;
            if (soloDisponibles && !estaDisponible(obra)) return false;
            return true;
        })
        .sort(ORDENADORES[orden]);

    /* ===== Acciones ===== */

    const fijarCategorias = (claves) => {
        const nuevos = new URLSearchParams();
        claves.forEach((c) => nuevos.append('categoria', nombrePorClave[c] || c));
        setSearchParams(nuevos);
    };

    const alternarCategoria = (clave) =>
        fijarCategorias(
            seleccionadas.includes(clave)
                ? seleccionadas.filter((c) => c !== clave)
                : [...seleccionadas, clave]
        );

    const limpiarFiltros = () => {
        setSearchParams(new URLSearchParams());
        setRangoUsuario(null);
        setSoloDisponibles(false);
    };

    return (
        <div className="catalogo">
            {/* ===== Cabecera ===== */}
            <header className="catalogo-cabecera">
                <div>
                    <span className="catalogo-eyebrow">Catálogo</span>
                    <h1 className="catalogo-titulo">Explorar piezas</h1>
                    <p className="catalogo-subtitulo">
                        Obras y artesanías hechas a mano, con paciencia y dedicación. Cada pieza
                        conserva la huella de quien la creó.
                    </p>
                </div>

                <div className="catalogo-controles">
                    <div className="catalogo-contador">
                        <i className="fa-solid fa-palette" aria-hidden="true"></i>
                        <strong>{obras.length} {obras.length === 1 ? 'pieza' : 'piezas'}</strong>
                    </div>

                    <label className="catalogo-orden">
                        <span>Ordenar por:</span>
                        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                            <option value="recientes">Más recientes</option>
                            <option value="precio-asc">Precio: menor a mayor</option>
                            <option value="precio-desc">Precio: mayor a menor</option>
                            <option value="nombre">Nombre (A-Z)</option>
                        </select>
                    </label>
                </div>
            </header>

            {/* ===== Categorías rápidas ===== */}
            {categorias.length > 0 && (
                <div className="catalogo-chips" role="group" aria-label="Categorías">
                    <button
                        type="button"
                        className={`catalogo-chip ${seleccionadas.length === 0 ? 'activo' : ''}`}
                        onClick={() => fijarCategorias([])}
                    >
                        Todas las categorías
                    </button>
                    {categorias.map((c) => (
                        <button
                            key={c.clave}
                            type="button"
                            className={`catalogo-chip ${seleccionadas.includes(c.clave) ? 'activo' : ''}`}
                            onClick={() => fijarCategorias([c.clave])}
                        >
                            {c.nombre} ({c.cantidad})
                        </button>
                    ))}
                </div>
            )}

            <button
                type="button"
                className="catalogo-btn-filtros"
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                aria-expanded={filtrosAbiertos}
            >
                <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                {filtrosAbiertos ? 'Ocultar filtros' : 'Filtros'}
            </button>

            <div className="catalogo-layout">
                {/* ===== Barra lateral de filtros ===== */}
                <aside className={`catalogo-filtros ${filtrosAbiertos ? 'abierto' : ''}`}>
                    <div className="filtros-cabecera">
                        <h2 className="filtros-titulo">
                            <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                            Filtrar colección
                        </h2>
                        <button
                            type="button"
                            className="filtros-limpiar"
                            onClick={limpiarFiltros}
                            disabled={!hayFiltros}
                        >
                            Limpiar todo
                        </button>
                    </div>

                    {categorias.length > 0 && (
                        <fieldset className="filtros-grupo">
                            <legend>Categoría</legend>
                            {categorias.map((c) => (
                                <label key={c.clave} className="filtros-opcion">
                                    <input
                                        type="checkbox"
                                        checked={seleccionadas.includes(c.clave)}
                                        onChange={() => alternarCategoria(c.clave)}
                                    />
                                    <span className="filtros-opcion-texto">{c.nombre}</span>
                                    <span className="filtros-opcion-cantidad">{c.cantidad}</span>
                                </label>
                            ))}
                        </fieldset>
                    )}

                    {precioMax > precioMin && (
                        <fieldset className="filtros-grupo">
                            <legend>Rango de precio</legend>
                            <p className="filtros-rango-valores">
                                {formatear(rango[0])} — {formatear(rango[1])}
                            </p>
                            <Slider
                                value={rango}
                                min={precioMin}
                                max={precioMax}
                                step={100}
                                onChange={(_, valor) => setRangoUsuario(valor)}
                                disableSwap
                                aria-label="Rango de precio"
                                sx={{ color: 'var(--primary-color)', mx: 1, width: 'calc(100% - 16px)' }}
                            />
                            <div className="filtros-rango-extremos">
                                <span>{formatear(precioMin)}</span>
                                <span>{formatear(precioMax)}</span>
                            </div>
                        </fieldset>
                    )}

                    <fieldset className="filtros-grupo">
                        <legend>Disponibilidad</legend>
                        <label className="filtros-opcion">
                            <input
                                type="radio"
                                name="disponibilidad"
                                checked={!soloDisponibles}
                                onChange={() => setSoloDisponibles(false)}
                            />
                            <span className="filtros-opcion-texto">Todas las piezas</span>
                        </label>
                        <label className="filtros-opcion">
                            <input
                                type="radio"
                                name="disponibilidad"
                                checked={soloDisponibles}
                                onChange={() => setSoloDisponibles(true)}
                            />
                            <span className="filtros-opcion-texto">Solo disponibles</span>
                        </label>
                    </fieldset>
                </aside>

                {/* ===== Resultados ===== */}
                <div className="catalogo-contenido">
                    <div className="catalogo-contenido-cabecera">
                        <h2 className="catalogo-subtitulo-lista">Selección destacada</h2>
                        <span className="catalogo-pildora">
                            {visibles.length} de {obras.length} {obras.length === 1 ? 'pieza' : 'piezas'}
                        </span>
                    </div>

                    {visibles.length === 0 ? (
                        <div className="catalogo-vacio">
                            <p>
                                {obras.length === 0
                                    ? 'Todavía no hay piezas para mostrar.'
                                    : 'No hay piezas con estos filtros.'}
                            </p>
                            {hayFiltros && (
                                <button type="button" className="catalogo-btn-limpiar" onClick={limpiarFiltros}>
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="catalogo-grid">
                            {visibles.map((obra) => (
                                <Pintura
                                    key={obra.id}
                                    id={obra.id}
                                    titulo={obra.titulo}
                                    precio={obra.precio}
                                    imagen={obra.imagen}
                                    descripcion={obra.descripcion}
                                    stock={obra.stock}
                                    categoria={obra.categoria}
                                    textoImagen={obra.textoImagen || 'Sin imagen'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Galeria;