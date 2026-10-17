import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../hook/useAdmin.js';
import '../css/nav.css';

// Marca con la clase "active" el enlace de la página donde estás
const claseActiva = ({ isActive }) => (isActive ? 'active' : undefined);

const Nav = () => {
    const { adminActivo, cerrarSesion } = useAdmin(); // Traemos los datos de la sesión
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false); // Controla si el menú está visible

    const manejarCierreSesion = () => {
        cerrarSesion(); // Esto borra la sesión del Context y localStorage

        // window.location.href fuerza al navegador a recargar la página por completo
        // y llevarte a la ruta raíz ('/').
        window.location.href = '/';
    };

    return (
        <nav className="main-nav">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/">
                        <h2>Disfrut-Arte</h2>
                    </Link>
                </div>

                <ul className="nav-links">
                    <li>
                        <NavLink to="/" end className={claseActiva}>
                            Inicio
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/productos" className={claseActiva}>
                            Explorar Piezas
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/as" className={claseActiva}>
                            Sobre Nosotros
                        </NavLink>
                    </li>
                </ul>

                <div className="nav-icons">
                    {/* Ícono de Favoritos */}
                    <Link to="/favoritos" className="fav-link" aria-label="Favoritos">
                        <i className="fa-solid fa-heart"></i>
                    </Link>

                    {/* Lógica Condicional: Si hay admin, muestra el dropdown. Si no, muestra "Ingresar" */}
                    {adminActivo ? (
                        <div className="user-dropdown-container" onClick={() => setMenuAbierto(!menuAbierto)}>
                            <div className="user-menu-trigger">
                                <i className="fa-solid fa-user"></i>
                                <span>{adminActivo.usuario}</span>
                                <i className="fa-solid fa-caret-down"></i> {/* Flechita hacia abajo */}
                            </div>

                            {/* Opciones del menú desplegable */}
                            {menuAbierto && (
                                <div className="user-dropdown-menu">
                                    <Link to="/mi-cuenta">Mi cuenta</Link>
                                    <button onClick={manejarCierreSesion}>Salir</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="user-link">
                            <i className="fa-solid fa-user"></i> <span>Ingresar</span>
                        </Link>
                    )}

                    {/* Ícono de Carrito */}
                    <Link to="/carrito" className="fav-link" aria-label="Carrito">
                        <i className="fa-solid fa-cart-shopping"></i>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Nav;